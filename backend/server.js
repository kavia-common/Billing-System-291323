import express from "express";
import cors from "cors";
import "dotenv/config";
import productRouter from "./routes/productRoute.js";
import billingHistoryRouter from "./routes/billingHistoryRoute.js";
import { getSupabaseClient } from "./lib/supabaseClient.js";

const app = express();
// Default to 3001 to match expected backend port if not provided
const port = Number(process.env.PORT) || 3001;

// Validate Supabase environment presence early
const hasSupabaseUrl = !!process.env.SUPABASE_URL;
const hasSupabaseKey = !!process.env.SUPABASE_KEY;
if (!hasSupabaseUrl || !hasSupabaseKey) {
  console.warn(
    "Warning: SUPABASE_URL or SUPABASE_KEY are not set. API routes will fail without them."
  );
}

// JSON and CORS middleware
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "id"],
  })
);

// Health endpoint to check readiness without requiring Supabase queries
// PUBLIC_INTERFACE
app.get("/health", (req, res) => {
  /**
   * Returns readiness information for the backend.
   * - status: ok
   * - port: bound port
   * - supabaseEnv: hasUrl/hasKey booleans (for diagnostics only)
   * - warnings: array of non-fatal warnings
   */
  const warnings = [];
  if (!process.env.PORT) warnings.push("PORT not set, defaulting to 3001.");
  if (!hasSupabaseUrl || !hasSupabaseKey)
    warnings.push("SUPABASE_URL or SUPABASE_KEY not set. API calls will fail.");

  res.json({
    status: "ok",
    port,
    supabaseEnv: {
      hasUrl: hasSupabaseUrl,
      hasKey: hasSupabaseKey,
    },
    warnings,
  });
});

// Non-sensitive config flags endpoint
// PUBLIC_INTERFACE
app.get("/api/meta/config", (req, res) => {
  /**
   * Returns non-sensitive configuration flags to assist with client-side diagnostics.
   * Response:
   *  { supabaseConfigured: boolean }
   */
  res.json({
    supabaseConfigured: hasSupabaseUrl && hasSupabaseKey,
  });
});

// PUBLIC_INTERFACE
app.post("/api/admin/db/check", async (req, res) => {
  /**
   * Probes the existence of required tables and returns helpful guidance if missing.
   * Does not create or modify data. Safe to call in diagnostics.
   * Response: { ok, productsExists, billingHistoryExists, hint? }
   */
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    return res.status(200).json({
      ok: false,
      productsExists: false,
      billingHistoryExists: false,
      hint:
        "Set SUPABASE_URL and SUPABASE_KEY in environment. See backend/.env.example and assets/supabase.md.",
    });
  }
  try {
    const supabase = getSupabaseClient();

    // Query minimal rows to infer relation existence
    const productsQ = await supabase.from("products").select("id").limit(1);
    const billingQ = await supabase.from("billing_history").select("id").limit(1);

    const productsExists =
      !productsQ.error || !/does not exist/i.test(productsQ.error?.message || "");
    const billingHistoryExists =
      !billingQ.error || !/does not exist/i.test(billingQ.error?.message || "");

    const resp = {
      ok: productsExists && billingHistoryExists,
      productsExists,
      billingHistoryExists,
    };

    if (!productsExists || !billingHistoryExists) {
      resp.hint =
        "Run backend/scripts/supabase_init.sql in the Supabase SQL editor to create required tables.";
    }

    res.json(resp);
  } catch (e) {
    res.json({
      ok: false,
      productsExists: false,
      billingHistoryExists: false,
      hint:
        "Unexpected error probing DB. Ensure Supabase credentials are valid and network allows access.",
      error: String(e?.message || e),
    });
  }
});

app.use("/api/product", productRouter);
app.use("/api/billinghistory", billingHistoryRouter);

app.get("/", (req, res) => {
  res.send("API WORKING (Supabase-backed)");
});

app.listen(port, () => {
  console.log(`[Startup] Backend listening on port ${port}`);
  console.log(
    `[Startup] Supabase env present? url=${hasSupabaseUrl} key=${hasSupabaseKey}`
  );
});