// routes/adminBulkOrderRoutes.js
import express from "express";
import BulkOrder from "../models/BulkOrder.js";

const router = express.Router();

// Get all bulk orders - NO AUTH REQUIRED
router.get("/admin/all-orders", async (req, res) => {
  try {
    const orders = await BulkOrder.find()
      .populate("userId", "name email") // Populate user details from userId field
      .sort({ createdAt: -1 });
    
    console.log(`[Admin] Fetched ${orders.length} bulk orders`);
    
    // Transform the response to have user field for consistency with regular orders
    const transformedOrders = orders.map(order => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        user: orderObj.userId // Add user field for frontend consistency
      };
    });
    
    res.json(transformedOrders);
  } catch (error) {
    console.error("[Admin Fetch Bulk Orders Error]:", error);
    res.status(500).json({ message: "Failed to fetch bulk orders" });
  }
});

// Update bulk order status - NO AUTH REQUIRED
router.put("/admin/update-status/:orderId", async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const { orderId } = req.params;

    // Validate status
    const validStatuses = ["Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await BulkOrder.findByIdAndUpdate(
      orderId,
      { orderStatus: orderStatus },
      { new: true }
    ).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ message: "Bulk order not found" });
    }

    // Transform the response
    const orderObj = order.toObject();
    const transformedOrder = {
      ...orderObj,
      user: orderObj.userId
    };

    console.log(`[Admin] Bulk Order ${orderId} status updated to: ${orderStatus}`);
    res.json({ message: "Bulk order status updated", order: transformedOrder });
  } catch (error) {
    console.error("[Admin Update Bulk Order Status Error]:", error);
    res.status(500).json({ message: "Failed to update bulk order status" });
  }
});

// Cancel bulk order - NO AUTH REQUIRED (for admin use)
router.put("/admin/cancel/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await BulkOrder.findByIdAndUpdate(
      orderId,
      { orderStatus: "Cancelled" },
      { new: true }
    ).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ message: "Bulk order not found" });
    }

    // Transform the response
    const orderObj = order.toObject();
    const transformedOrder = {
      ...orderObj,
      user: orderObj.userId
    };

    console.log(`[Admin] Bulk Order ${orderId} cancelled`);
    res.json({ message: "Bulk order cancelled", order: transformedOrder });
  } catch (error) {
    console.error("[Admin Cancel Bulk Order Error]:", error);
    res.status(500).json({ message: "Failed to cancel bulk order" });
  }
});

// Get single bulk order details - NO AUTH REQUIRED
router.get("/admin/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await BulkOrder.findById(orderId)
      .populate("userId", "name email");
    
    if (!order) {
      return res.status(404).json({ message: "Bulk order not found" });
    }
    
    // Transform the response
    const orderObj = order.toObject();
    const transformedOrder = {
      ...orderObj,
      user: orderObj.userId
    };
    
    res.json(transformedOrder);
  } catch (error) {
    console.error("[Admin Fetch Bulk Order Error]:", error);
    res.status(500).json({ message: "Failed to fetch bulk order" });
  }
});

// Get bulk orders by user - NO AUTH REQUIRED (for admin)
router.get("/admin/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await BulkOrder.find({ userId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    
    // Transform the response
    const transformedOrders = orders.map(order => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        user: orderObj.userId
      };
    });
    
    console.log(`[Admin] Fetched ${orders.length} bulk orders for user ${userId}`);
    res.json(transformedOrders);
  } catch (error) {
    console.error("[Admin Fetch User Bulk Orders Error]:", error);
    res.status(500).json({ message: "Failed to fetch user bulk orders" });
  }
});

// Get order statistics - NO AUTH REQUIRED
router.get("/admin/stats", async (req, res) => {
  try {
    const totalOrders = await BulkOrder.countDocuments();
    const processingOrders = await BulkOrder.countDocuments({ orderStatus: "Processing" });
    const confirmedOrders = await BulkOrder.countDocuments({ orderStatus: "Confirmed" });
    const shippedOrders = await BulkOrder.countDocuments({ orderStatus: "Shipped" });
    const deliveredOrders = await BulkOrder.countDocuments({ orderStatus: "Delivered" });
    const cancelledOrders = await BulkOrder.countDocuments({ orderStatus: "Cancelled" });
    
    const totalRevenue = await BulkOrder.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$product.price" } } }
    ]);
    
    res.json({
      totalOrders,
      processingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error("[Admin Bulk Order Stats Error]:", error);
    res.status(500).json({ message: "Failed to fetch bulk order statistics" });
  }
});

export default router;