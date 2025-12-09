import express from "express";
import { addProduct, listProducts, removeProduct, updateProduct } from "../controller/productController.js";

const productRouter = express.Router();

// Lightweight ping endpoint to validate router mounting and controller import health
// PUBLIC_INTERFACE
productRouter.get("/ping", (req, res) => {
  /** Returns a simple OK response for router diagnostics. */
  res.json({ ok: true, route: "product" });
});

productRouter.post("/add", addProduct);
productRouter.delete("/remove", removeProduct);
productRouter.get("/list", listProducts);
productRouter.post("/update", updateProduct);

export default productRouter;