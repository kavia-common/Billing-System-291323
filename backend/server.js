import express from "express";
import cors from "cors";
import "dotenv/config";
import productRouter from "./routes/productRoute.js";
import billingHistoryRouter from "./routes/billingHistoryRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// Validate Supabase environment presence early
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.warn(
    "Warning: SUPABASE_URL or SUPABASE_KEY are not set. API routes will fail without them."
  );
}

app.use(express.json());
app.use(cors());

app.use("/api/product", productRouter);
app.use("/api/billinghistory", billingHistoryRouter);

app.get("/", (req, res) => {
  res.send("API WORKING (Supabase-backed)");
});

app.listen(port, () => {
  console.log("Server Running on ", port);
});