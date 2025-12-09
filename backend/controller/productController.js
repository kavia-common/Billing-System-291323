import { getSupabaseClient } from "../lib/supabaseClient.js";

/**
 * Product controller backed by Supabase (Postgres).
 * Table schema:
 *  products(id uuid pk default uuid_generate_v4(), name/description text, cp numeric, sp numeric, created_at timestamptz default now())
 */

// PUBLIC_INTERFACE
export const addProduct = async (req, res) => {
  /** Create a product in Supabase. Expects { description, cp, sp } in body. */
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
    res.json({ success: false, message: error.message });
  }
};

// PUBLIC_INTERFACE
export const removeProduct = async (req, res) => {
  /** Remove a product by id passed in headers.id */
  try {
    const id = req.headers.id;
    if (!id) return res.json({ success: false, message: "id header required" });
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// PUBLIC_INTERFACE
export const listProducts = async (req, res) => {
  /** List all products */
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
    res.json({ success: false, message: error.message });
  }
};

// PUBLIC_INTERFACE
export const updateProduct = async (req, res) => {
  /** Update a product by id. Body: { id, description, cp, sp } */
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
    res.json({ success: false, message: error.message });
  }
};
