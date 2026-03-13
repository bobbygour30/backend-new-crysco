import axios from "axios";

export const getNimbusToken = async () => {
  try {
    const res = await axios.post("https://api.nimbuspost.com/v1/users/login", {
      email: process.env.NIMBUS_EMAIL,
      password: process.env.NIMBUS_PASSWORD,
    });

    console.log("[Nimbus] Login response:", res.data);

    // Check if status is true and data exists (token is directly in data as string)
    if (!res.data?.status || !res.data?.data) {
      throw new Error(res.data?.message || "Failed to obtain Nimbus token");
    }

    // The token is directly in res.data.data as a string
    const token = res.data.data;
    console.log("[Nimbus] Token generated successfully");
    
    return token;
  } catch (error) {
    console.error("[Nimbus Auth Error]:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error("Nimbus authentication failed");
  }
};