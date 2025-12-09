import { getSupabaseClient } from "../lib/supabaseClient.js";

/**
 * Product controller backed by Supabase (Postgres).
 * Table schema:
 *  products(id uuid pk default uuid_generate_v4(), name/description text, cp numeric, sp numeric, created_at timestamptz default now())
 */

function translateDbError(error) {
  // Map common Postgres errors to helpful hints
  const msg = (error && (error.message || error.details || error.hint)) || "";
  if (/relation .*products.* does not exist/i.test(msg)) {
    return "Products table missing. Run SQL in backend/scripts/supabase_init.sql in Supabase.";
  }
  return error.message || "Unexpected database error";
}

/** PUBLIC_INTERFACE
 * addProduct
 * Create a product in Supabase.
 * Request body: { description: string, cp: number, sp: number }
 * Response: { success: boolean, message: string }
 */
export const addProduct = async (req, res) => {
  try {
    const { description, cp, sp } = req.body;
    if (!description || cp === undefined || sp === undefined) {
      return res.json({ success: false, message: "description, cp and sp are required" });
    }
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("products").insert([
      {
        name: description,
        description,
        cp: Number(cp),
        sp: Number(sp),
      },
    ]);
    if (error) throw error;
    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: translateDbError(error) });
  }
};

/** PUBLIC_INTERFACE
 * removeProduct
 * Remove a product by id passed in headers.id
 * Response: { success: boolean, message: string }
 */
export const removeProduct = async (req, res) => {
  try {
    const id = req.headers.id;
    if (!id) return res.json({ success: false, message: "id header required" });
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: translateDbError(error) });
  }
};

/** PUBLIC_INTERFACE
 * listProducts
 * List all products.
 * Response: { success: boolean, products: Array<{ _id, description, cp, sp, created_at }> }
 */
export const listProducts = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, cp, sp, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;

    // Adapt to existing frontend expectations: _id instead of id
    const products = (data || []).map((p) => ({
      _id: p.id,
      description: p.description || p.name || "",
      cp: Number(p.cp || 0),
      sp: Number(p.sp || 0),
      created_at: p.created_at,
    }));

    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: translateDbError(error) });
  }
};

/** PUBLIC_INTERFACE
 * updateProduct
 * Update a product by id.
 * Request body: { id: string, description: string, cp: number, sp: number }
 * Response: { success: boolean, message: string }
 */
export const updateProduct = async (req, res) => {
  try {
    const { id, description, cp, sp } = req.body;
    if (!id) return res.json({ success: false, message: "id is required" });

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("products")
      .update({
        name: description,
        description,
        cp: Number(cp),
        sp: Number(sp),
      })
      .eq("id", id);
    if (error) throw error;

    res.json({ success: true, message: "Product Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: translateDbError(error) });
  }
};
