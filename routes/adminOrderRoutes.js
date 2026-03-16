// routes/adminOrderRoutes.js
import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// Get all orders - NO AUTH REQUIRED
router.get("/admin/all-orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") // Populate user details
      .sort({ createdAt: -1 });
    
    console.log(`[Admin] Fetched ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error("[Admin Fetch Orders Error]:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Update order status - NO AUTH REQUIRED
router.put("/admin/update-status/:orderId", async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const { orderId } = req.params;

    // Validate status
    const validStatuses = ["Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(`[Admin] Order ${orderId} status updated to: ${orderStatus}`);
    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("[Admin Update Status Error]:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

export default router;