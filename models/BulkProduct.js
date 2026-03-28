import mongoose from "mongoose";

const priceMatrixSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  pack: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },
});

const bulkProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    sizes: [String],  // Array of available sizes
    packs: [String],  // Array of available packs
    priceMatrix: [priceMatrixSchema],  // Matrix of prices for each size+pack combination
    amazonLink: String,
    description: String,
    highlights: [String],
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.model("BulkProduct", bulkProductSchema);