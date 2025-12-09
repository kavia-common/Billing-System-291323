import express from "express";
import {
  addBillingHistory,
  listBillingHistory,
  clearBillingHistory,
  retrieveLastProduct,
  removeHistory,
  editBillHistory,
} from "../controller/billingHistoryController.js";

const billingHistoryRouter = express.Router();

// PUBLIC_INTERFACE
billingHistoryRouter.get("/ping", (req, res) => {
  /** Returns a simple OK response for router diagnostics. */
  res.json({ ok: true, route: "billinghistory" });
});

billingHistoryRouter.post("/add", addBillingHistory);
billingHistoryRouter.get("/list", listBillingHistory);
billingHistoryRouter.get("/lasthist", retrieveLastProduct);
billingHistoryRouter.delete("/removehistory", removeHistory);
billingHistoryRouter.post("/update", editBillHistory);
billingHistoryRouter.delete("/clearhistory", clearBillingHistory);

export default billingHistoryRouter;