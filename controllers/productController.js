import Product from "../models/Product.js";
import cloudinary from "../config/cloudnary.js";
import { Readable } from "stream";

console.log("Cloudinary Config Loaded:", cloudinary.config());

// Add Product
export const addProduct = async (req, res) => {
  try {
    const { title, category, categoryType, sizes, packs, priceMatrix, mrp, salePrice, amazonLink, description, highlights } = req.body;

    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      req.files.map(file => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "products" }, (err, result) => {
          if (result) resolve(result.secure_url);
          else reject(err);
        });
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
      }))
    );

    let parsedSizes = [];
    let parsedPacks = [];
    let parsedPriceMatrix = [];

    // Parse sizes
    if (sizes) {
      try {
        const temp = JSON.parse(sizes);
        if (Array.isArray(temp)) {
          parsedSizes = temp;
        } else if (typeof temp === "string") {
          parsedSizes = temp.split(",").map(s => s.trim());
        }
      } catch (err) {
        parsedSizes = sizes.split(",").map(s => s.trim());
      }
    }

    // Parse packs
    if (packs) {
      try {
        const temp = JSON.parse(packs);
        if (Array.isArray(temp)) {
          parsedPacks = temp;
        } else if (typeof temp === "string") {
          parsedPacks = temp.split(",").map(p => p.trim());
        }
      } catch (err) {
        parsedPacks = packs.split(",").map(p => p.trim());
      }
    }

    // Parse price matrix
    if (priceMatrix) {
      try {
        parsedPriceMatrix = JSON.parse(priceMatrix);
      } catch (err) {
        parsedPriceMatrix = [];
      }
    }

    // For garbage bags, mrp and salePrice might be null/undefined
    let parsedMrp = null;
    let parsedSalePrice = null;
    
    if (category === "garbage bags") {
      // If it's garbage bags with price matrix, we don't need mrp/salePrice
      parsedMrp = null;
      parsedSalePrice = null;
    } else {
      // For other categories, parse the numbers
      parsedMrp = mrp && mrp !== "null" && mrp !== null ? Number(mrp) : null;
      parsedSalePrice = salePrice && salePrice !== "null" && salePrice !== null ? Number(salePrice) : null;
    }

    const product = await Product.create({
      title,
      category,
      categoryType,
      sizes: parsedSizes,
      packs: parsedPacks,
      priceMatrix: parsedPriceMatrix,
      mrp: parsedMrp,
      salePrice: parsedSalePrice,
      amazonLink,
      description,
      highlights: highlights ? JSON.parse(highlights) : [],
      images: imageUrls,
    });

    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category) {
      const formattedCategory = category.toLowerCase().replace(/-/g, " ").trim();
      filter.category = formattedCategory;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get product by ID
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      categoryType,
      sizes,
      packs,
      priceMatrix,
      mrp,
      salePrice,
      amazonLink,
      description,
      highlights,
      existingImages,
      amazingDeals,
      newArrivals,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Parse sizes
    let parsedSizes = [];
    if (sizes) {
      try {
        const temp = JSON.parse(sizes);
        if (Array.isArray(temp)) {
          parsedSizes = temp;
        } else {
          parsedSizes = temp.split(",").map((s) => s.trim());
        }
      } catch {
        parsedSizes = sizes.split(",").map((s) => s.trim());
      }
    }

    // Parse packs
    let parsedPacks = [];
    if (packs) {
      try {
        const temp = JSON.parse(packs);
        if (Array.isArray(temp)) {
          parsedPacks = temp;
        } else {
          parsedPacks = temp.split(",").map((p) => p.trim());
        }
      } catch {
        parsedPacks = packs.split(",").map((p) => p.trim());
      }
    }

    // Parse price matrix
    let parsedPriceMatrix = [];
    if (priceMatrix) {
      try {
        parsedPriceMatrix = JSON.parse(priceMatrix);
      } catch {
        parsedPriceMatrix = [];
      }
    }

    // Parse highlights
    let parsedHighlights = [];
    if (highlights) {
      try {
        const temp = JSON.parse(highlights);
        parsedHighlights = Array.isArray(temp)
          ? temp
          : temp.split(",").map((h) => h.trim());
      } catch {
        parsedHighlights = highlights.split(",").map((h) => h.trim());
      }
    }

    // Parse existing images
    let parsedExistingImages = product.images;
    if (existingImages) {
      try {
        parsedExistingImages = JSON.parse(existingImages);
      } catch {
        parsedExistingImages = product.images;
      }
    }

    // Handle mrp and salePrice based on category
    let parsedMrp = null;
    let parsedSalePrice = null;
    
    if (category === "garbage bags") {
      // For garbage bags, we use price matrix, so mrp/salePrice should be null
      parsedMrp = null;
      parsedSalePrice = null;
    } else {
      // For other categories, parse the numbers if they exist and are not "null"
      if (mrp && mrp !== "null" && mrp !== null && mrp !== "") {
        parsedMrp = Number(mrp);
      }
      if (salePrice && salePrice !== "null" && salePrice !== null && salePrice !== "") {
        parsedSalePrice = Number(salePrice);
      }
    }

    // Basic update
    product.title = title || product.title;
    product.category = category || product.category;
    product.mrp = parsedMrp;
    product.salePrice = parsedSalePrice;
    product.amazonLink = amazonLink || product.amazonLink;
    product.description = description || product.description;
    product.highlights = parsedHighlights;
    product.sizes = parsedSizes;
    product.packs = parsedPacks;
    product.priceMatrix = parsedPriceMatrix;

    // Category logic
    if (category === "garbage bags") {
      product.categoryType = categoryType || "";
    } else {
      product.categoryType = "";
    }

    // Boolean flags
    product.amazingDeals = amazingDeals === "true" || amazingDeals === true;
    product.newArrivals = newArrivals === "true" || newArrivals === true;

    // Image merge system
    let updatedImages = [...parsedExistingImages];

    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(
        req.files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "products" },
                (err, result) => {
                  if (result) resolve(result.secure_url);
                  else reject(err);
                }
              );

              const bufferStream = new Readable();
              bufferStream.push(file.buffer);
              bufferStream.push(null);
              bufferStream.pipe(stream);
            })
        )
      );

      updatedImages = [...updatedImages, ...newImages];
    }

    product.images = updatedImages;

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      message: "Server error while updating product",
    });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};