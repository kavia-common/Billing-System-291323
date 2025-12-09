import { getSupabaseClient } from "../lib/supabaseClient.js";

/**
 * Billing history controller backed by Supabase (Postgres).
 * Table schema:
 *  billing_history(id uuid pk default uuid_generate_v4(),
 *    bill_no text, customer_name text, bill_from text, items jsonb,
 *    total numeric(12,2), paid numeric(12,2), balance numeric(12,2),
 *    notes text, created_at timestamptz default now())
 *
 * The existing frontend expects fields:
 *  billNum, billTo, billFrom, products(array of { _id, description, cp, sp, quantity }), totalAmt, date, time, savings
 * We will map to and from our schema to preserve UI behavior.
 */

// Compute totals and savings from items
function computeTotals(products) {
  const totalAmt = products.reduce((s, it) => s + Number(it.sp || 0) * Number(it.quantity || 0), 0);
  const cpSum = products.reduce((s, it) => s + Number(it.cp || 0) * Number(it.quantity || 0), 0);
  const savings = totalAmt - cpSum;
  return { totalAmt, savings };
}

function toFrontendRecord(row) {
  const createdAt = row.created_at ? new Date(row.created_at) : new Date();
  const dd = String(createdAt.getDate()).padStart(2, "0");
  const mm = String(createdAt.getMonth() + 1).padStart(2, "0");
  const yyyy = createdAt.getFullYear();
  const date = `${dd}/${mm}/${yyyy}`;
  const time = createdAt.toLocaleTimeString("en-US", { hour12: true });

  // items -> products
  const products = Array.isArray(row.items) ? row.items : [];
  const { totalAmt, savings } = computeTotals(products);

  return {
    _id: row.id,
    billNum: row.bill_no,
    billTo: row.customer_name,
    billFrom: row.bill_from || "",
    products,
    totalAmt: Number(row.total ?? totalAmt),
    date,
    time,
    savings: Number(row.savings ?? savings),
  };
}

function translateDbError(error) {
  const msg = (error && (error.message || error.details || error.hint)) || "";
  if (/relation .*billing_history.* does not exist/i.test(msg)) {
    return "Billing history table missing. Run SQL in backend/scripts/supabase_init.sql in Supabase.";
  }
  return error.message || "Unexpected database error";
}

// PUBLIC_INTERFACE
export const addBillingHistory = async (req, res) => {
  /** Create a billing history record. Expects body: { products, billNum, billTo, billFrom, date?, time? } */
  try {
    const { products, date, time, billNum, billTo, billFrom } = req.body;

    if (!Array.isArray(products) || !billNum || !billTo) {
      return res.json({ success: false, message: "products[], billNum and billTo are required" });
    }

    const { totalAmt, savings } = computeTotals(products);

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("billing_history").insert([
      {
        bill_no: billNum,
        customer_name: billTo,
        bill_from: billFrom || "",
        items: products,
        total: totalAmt,
        notes: null,
        paid: null,
        balance: null,
        // created_at is default now(); date/time fields are derived client-side in existing UI
        savings,
      },
    ]);
    if (error) throw error;

    res.json({ success: true, message: "History Saved" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: translateDbError(error) });
  }
};

// PUBLIC_INTERFACE
export const listBillingHistory = async (req, res) => {
  /** List billing history records (optionally filtered by customer via ?customer=) */
  try {
    const supabase = getSupabaseClient();
    const customer = req.query.customer;
    let query = supabase
      .from("billing_history")
      .select("id, bill_no, customer_name, bill_from, items, total, notes, paid, balance, savings, created_at")
      .order("created_at", { ascending: true }); // frontends reverse themselves

    if (customer) {
      query = query.ilike("customer_name", `%${customer}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const billingHistory = (data || []).map(toFrontendRecord);
    res.json({ success: true, billingHistory });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: translateDbError(error) });
  }
};

// PUBLIC_INTERFACE
export const clearBillingHistory = async (req, res) => {
  /** Clear all billing history */
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("billing_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw error;
    res.json({ success: true, message: "History Cleared" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: translateDbError(error) });
  }
};

// PUBLIC_INTERFACE
export const retrieveLastProduct = async (req, res) => {
  /** Compute next bill number like IMSW<number>, based on last record's bill_no. */
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("billing_history")
      .select("bill_no, created_at")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;

    let newBillNumber;
    if (data && data.length > 0 && data[0].bill_no) {
      const last = data[0].bill_no;
      const suffix = Number(String(last).replace(/^\D+/g, "")) || 25000;
      newBillNumber = "IMSW" + (suffix + 1);
    } else {
      newBillNumber = "IMSW25000";
    }
    res.json({ success: true, billNumber: newBillNumber });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: translateDbError(error) });
  }
};

// PUBLIC_INTERFACE
export const removeHistory = async (req, res) => {
  /** Remove a billing history by id in headers.id */
  try {
    const id = req.headers.id;
    if (!id) return res.json({ success: false, message: "id header required" });

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("billing_history").delete().eq("id", id);
    if (error) throw error;

    res.json({ success: true, message: "History Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: translateDbError(error) });
  }
};

// PUBLIC_INTERFACE
export const editBillHistory = async (req, res) => {
  /** Update a billing history. Expects { bill } in body with fields like existing UI record. */
  try {
    const billingHistoryData = req.body.bill;
    if (!billingHistoryData || !billingHistoryData._id) {
      return res.json({ success: false, message: "bill object with _id is required" });
    }
    const { _id, billNum, billTo, billFrom, products, totalAmt } = billingHistoryData;

    const { totalAmt: computedTotal, savings } = computeTotals(products || []);
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("billing_history")
      .update({
        bill_no: billNum,
        customer_name: billTo,
        bill_from: billFrom || "",
        items: products || [],
        total: Number(totalAmt ?? computedTotal),
        savings: Number(savings),
      })
      .eq("id", _id);
    if (error) throw error;

    res.json({ success: true, message: "History Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: translateDbError(error) });
  }
};
