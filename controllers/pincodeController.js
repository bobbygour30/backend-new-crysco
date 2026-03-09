import axios from "axios";
import { getNimbusToken } from "../utils/nimbus.js";

export const checkPincode = async (req, res) => {

  try {

    const { pincode } = req.body;

    const token = await getNimbusToken();

    console.log("Token:", token);

    const response = await axios.post(
      "https://ship.nimbuspost.com/api/v1/courier/serviceability",
      {
        pickup_postcode: process.env.PICKUP_PINCODE,
        delivery_postcode: pincode,
        weight: 1
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("Nimbus Response:", response.data);

    if (
      !response.data.data ||
      !response.data.data.available_courier_companies ||
      response.data.data.available_courier_companies.length === 0
    ) {

      return res.json({
        success:false,
        message:"Delivery not available"
      });

    }

    res.json({
      success:true,
      message:"Delivery available"
    });

  } catch (err) {

    console.log("Nimbus Error:", err.response?.data || err.message);

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

};