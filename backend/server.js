import express from "express";
import cors from "cors";
import "dotenv/config";
import productRouter from "./routes/productRoute.js";
import billingHistoryRouter from "./routes/billingHistoryRoute.js";

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

app.use(express.json());
app.use(cors());

// Health endpoint to check readiness without requiring Supabase queries
// PUBLIC_INTERFACE
app.get("/health", (req, res) => {
  /**
   * Returns readiness information for the backend.
   * - status: ok
   * - port: bound port
   * - supabaseEnv: hasUrl/hasKey booleans (for diagnostics only)
   */
  res.json({
    status: "ok",
    port,
    supabaseEnv: {
      hasUrl: hasSupabaseUrl,
      hasKey: hasSupabaseKey,
    },
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