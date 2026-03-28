import Razorpay from "razorpay";
import crypto from "crypto";
import BulkOrder from "../models/BulkOrder.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= CREATE ORDER =================
export const createBulkOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount required" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// ================= VERIFY PAYMENT =================
export const verifyBulkPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      product,
      shippingAddress,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // ✅ Create order with proper size information
    const order = await BulkOrder.create({
      userId: req.user._id,
      product: {
        productId: product._id,
        title: product.title,
        price: product.price,
        size: product.size || null,  // ✅ Store the selected size
        color: product.color || null,
        image: product.image,
      },
      shippingAddress,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
    });

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// ================= GET USER BULK ORDERS =================
export const getMyBulkOrders = async (req, res) => {
  try {
    const orders = await BulkOrder.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};