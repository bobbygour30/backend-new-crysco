import express from "express";
import { createOrder } from "../controllers/paymentController.js";
import { checkPincode } from "../controllers/pincodeController.js";
import { createShipment } from "../controllers/shipmentController.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/check-pincode", checkPincode);
router.post("/create-shipment", createShipment);

export default router;