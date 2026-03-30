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

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  categoryType: { type: String },
  sizes: { type: [String], default: [] },
  packs: { type: [String], default: [] },
  priceMatrix: [priceMatrixSchema],
  mrp: { type: Number },
  salePrice: { type: Number },
  amazonLink: { type: String },
  description: { type: String },
  highlights: {
    type: [String],
    default: [],
  },
  images: [{ type: String }],
  amazingDeals: {
    type: Boolean,
    default: false,
  },
  newArrivals: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;