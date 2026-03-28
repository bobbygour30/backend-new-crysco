import mongoose from "mongoose";

const bulkOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      productId: String,
      title: String,
      price: Number,
      size: String,  // This will store "Small / 3 Rolls" format
      color: String,
      image: String,
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
    },
    paymentId: String,
    orderId: String,
    signature: String,
    paymentStatus: {
      type: String,
      default: "Paid",
    },
  },
  { timestamps: true }
);

export default mongoose.model("BulkOrder", bulkOrderSchema);