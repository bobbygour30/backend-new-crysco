import express from "express";
import {
  createBulkOrder,
  verifyBulkPayment,
  getMyBulkOrders,
} from "../controllers/bulkPaymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createBulkOrder);

router.post("/verify", protect, verifyBulkPayment);

router.get("/my-orders", protect, getMyBulkOrders);

export default router;