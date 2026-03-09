import axios from "axios";

export const getNimbusToken = async () => {
  try {

    const res = await axios.post(
      "https://ship.nimbuspost.com/api/v1/auth/login",
      {
        email: process.env.NIMBUS_EMAIL,
        password: process.env.NIMBUS_PASSWORD,
      }
    );

    console.log("Nimbus Login Response:", res.data);

    return res.data.data.token;

  } catch (error) {

    console.log("Nimbus Login Error:", error.response?.data || error.message);
    throw error;

  }
};