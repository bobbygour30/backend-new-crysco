import axios from "axios";
import { getNimbusToken } from "../utils/getNimbusToken.js";

export const createShipment = async (req, res) => {
  try {
    const {
      orderId,
      fullName,
      phone,
      address,
      city,
      pincode,
      state,
      items,
      totalAmount,
    } = req.body;

    // Validate required fields
    if (
      !orderId ||
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

    // Get NimbusPost token
    const token = await getNimbusToken();

    // Calculate total weight (500g per item as base)
    const totalWeight = items.reduce((sum, item) => 
      sum + (Number(item.quantity) * 500), 0);

    // Format phone number (remove non-digits)
    const formattedPhone = phone.replace(/\D/g, "");

    // Prepare the payload according to NimbusPost API docs
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
        warehouse_name: process.env.PICKUP_WAREHOUSE_NAME || "Trikaya Fashion India",
        name: process.env.PICKUP_CONTACT_PERSON || "Satish Kumar",
        address: process.env.PICKUP_ADDRESS || "SHOP NO.20 SURAJ MARKET OM NAGAR MOHAN NAGAR",
        address_2: "",
        city: process.env.PICKUP_CITY || "Ghaziabad",
        state: process.env.PICKUP_STATE || "Uttar Pradesh",
        pincode: process.env.PICKUP_PINCODE || "201007",
        phone: process.env.PICKUP_PHONE || "9990955454",
      },
      order_items: items.map((item, index) => ({
        name: (item.name || "Product").trim().substring(0, 100),
        qty: String(Number(item.quantity) || 1),
        price: String(Number(item.price) || 0),
        sku: item.sku || item._id || `SKU-${String(index + 1).padStart(3, '0')}`,
      })),
    };

    console.log("[Nimbus] Shipment payload:", JSON.stringify(payload, null, 2));

    // Make API call to NimbusPost
    const response = await axios.post(
      "https://api.nimbuspost.com/v1/shipments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log("[Nimbus] Shipment response:", response.data);

    // Check if shipment was created successfully
    if (!response.data?.status) {
      throw new Error(response.data?.message || "NimbusPost rejected shipment");
    }

    // Return success response with shipment details
    res.json({
      success: true,
      shipment: response.data.data,
      awb: response.data.data?.awb_number || null,
      order_id: response.data.data?.order_id || orderId,
      message: "Shipment created successfully"
    });

  } catch (error) {
    console.error("[Shipment Creation Error]:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });

    // Return detailed error for debugging
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message || "Failed to create shipment",
      error: error.response?.data || null,
      // Don't block the order - payment is already successful
      // The order can be created manually later
      order_placed: true,
      note: "Payment successful but shipment creation failed. Our team will create the shipment manually."
    });
  }
};