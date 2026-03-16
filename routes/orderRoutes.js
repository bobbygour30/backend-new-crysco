// routes/orderRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();

// Get user's orders from database
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders for user:`, req.user._id);
    res.json(orders);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Cancel order
router.put("/cancel/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId,
      user: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order can be cancelled
    if (order.orderStatus !== "Processing") {
      return res.status(400).json({ 
        message: "Order cannot be cancelled at this stage" 
      });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Cancel Error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

export default router;