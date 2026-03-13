export const checkPincode = async (req, res) => {
  const { pincode } = req.body;

  // Basic validation only
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({
      success: false,
      message: "Valid 6-digit pincode is required",
    });
  }

  // Always return success to not block checkout
  // You can add logic here later if needed
  return res.json({
    success: true,
    message: "Pincode is serviceable",
    data: {}
  });
};