import axios from "axios";
import Cart from "../models/Cart.js";
import { getNimbusToken } from "../utils/getNimbusToken.js";
import Order from "../models/Order.js"; 

export const createShipment = async (req, res) => {
  try {
    const {
      orderId,
      userId,
      fullName,
      phone,
      address,
      city,
      pincode,
      state,
      items,
      totalAmount,
    } = req.body;

    console.log("[Shipment] Received request:", {
      orderId,
      userId,
      fullName,
      phone,
      city,
      pincode,
      itemsCount: items?.length,
      totalAmount
    });

    // ✅ Validate required fields
    if (
      !orderId ||
      !userId ||
      !fullName?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !pincode ||
      !state?.trim() ||
      !items?.length ||
      !totalAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid required fields",
      });
    }

    // ✅ Get NimbusPost token
    const token = await getNimbusToken();

    // ✅ Calculate total weight (500g per item)
    const totalWeight = items.reduce(
      (sum, item) => sum + Number(item.quantity || 1) * 500,
      0
    );

    const formattedPhone = phone.replace(/\D/g, "");

    const supportEmail =
      process.env.NIMBUS_VERIFIED_EMAIL || "trikayafashion01@gmail.com";

    const supportPhone =
      process.env.PICKUP_PHONE || "9990955454";

    // ✅ Nimbus payload
    const payload = {
      order_number: orderId,
      payment_type: "prepaid",
      order_amount: Number(totalAmount).toFixed(2),
      package_weight: totalWeight,
      package_length: 20,
      package_breadth: 15,
      package_height: 10,
      request_auto_pickup: "yes",
      shipping_charges: 0,
      cod_charges: 0,
      discount: 0,

      support_email: supportEmail,
      support_phone: supportPhone,

      consignee: {
        name: fullName.trim(),
        address: address.trim(),
        address_2: "",
        city: city.trim(),
        state: state.trim(),
        pincode: pincode,
        phone: formattedPhone,
      },

      pickup: {
        warehouse_name:
          process.env.PICKUP_WAREHOUSE_NAME || "Trikaya Fashion India",
        name: process.env.PICKUP_CONTACT_PERSON || "Satish Kumar",
        address:
          process.env.PICKUP_ADDRESS ||
          "SHOP NO.20 SURAJ MARKET OM NAGAR MOHAN NAGAR",
        address_2: "",
        city: process.env.PICKUP_CITY || "Ghaziabad",
        state: process.env.PICKUP_STATE || "Uttar Pradesh",
        pincode: process.env.PICKUP_PINCODE || "201007",
        phone: process.env.PICKUP_PHONE || "9990955454",
      },

      order_items: items.map((item, index) => ({
        name: (item.title || "Product").substring(0, 100),
        qty: String(Number(item.quantity) || 1),
        price: String(Number(item.price) || 0),
        sku:
          item.sku ||
          item.productId ||
          `SKU-${String(index + 1).padStart(3, "0")}`,
      })),
    };

    console.log("[Nimbus] Shipment payload:", payload);

    // ✅ Call Nimbus API
    const response = await axios.post(
      "https://api.nimbuspost.com/v1/shipments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("[Nimbus] Shipment response:", response.data);

    if (!response.data?.status) {
      throw new Error(response.data?.message || "NimbusPost rejected shipment");
    }

    // ✅ IMPORTANT: Save order to database
    const newOrder = new Order({
      user: userId,
      items: items,
      shippingAddress: {
        fullName,
        phone,
        address,
        city,
        pincode,
      },
      totalAmount: totalAmount,
      razorpayOrderId: orderId,
      status: "Paid",
      orderStatus: "Processing",
    });

    await newOrder.save();
    console.log("[Database] Order saved successfully with ID:", newOrder._id);

    // ✅ Clear cart
    await Cart.updateOne(
      { user: userId },
      { $set: { items: [] } }
    );

    console.log("Cart items cleared for user:", userId);

    res.json({
      success: true,
      shipment: response.data.data,
      awb: response.data.data?.awb_number || null,
      order_id: response.data.data?.order_id || orderId,
      db_order_id: newOrder._id,
      message: "Shipment created and order saved successfully",
    });

  } catch (error) {
    console.error("[Shipment Creation Error]:", {
      message: error.message,
      response: error.response?.data,
    });

    res.status(200).json({
      success: false,
      message: "Payment successful but shipment creation failed",
      error: error.message,
      orderId: req.body.orderId,
    });
  }
};