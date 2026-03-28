import BulkProduct from "../models/BulkProduct.js";
import cloudinary from "../config/cloudnary.js";

// ✅ CREATE BULK PRODUCT
export const createBulkProduct = async (req, res) => {
  try {
    const { title, category, sizes, packs, priceMatrix, amazonLink, description, highlights } = req.body;

    const parsedSizes = JSON.parse(sizes || "[]");
    const parsedPacks = JSON.parse(packs || "[]");
    const parsedPriceMatrix = JSON.parse(priceMatrix || "[]");
    const parsedHighlights = JSON.parse(highlights || "[]");

    const uploadedImages = [];

    // Upload images to Cloudinary
    for (let file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "bulk_products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });
      uploadedImages.push(result.secure_url);
    }

    const product = await BulkProduct.create({
      title,
      category,
      sizes: parsedSizes,
      packs: parsedPacks,
      priceMatrix: parsedPriceMatrix,
      amazonLink,
      description,
      highlights: parsedHighlights,
      images: uploadedImages,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Error in createBulkProduct:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET ALL BULK PRODUCTS
export const getBulkProducts = async (req, res) => {
  try {
    const products = await BulkProduct.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Bulk fetch error:", error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack
    });
  }
};

// ✅ GET ONE
export const getBulkProductById = async (req, res) => {
  try {
    const product = await BulkProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE BULK PRODUCT
export const updateBulkProduct = async (req, res) => {
  try {
    const { title, category, amazonLink, description } = req.body;

    const parsedSizes = JSON.parse(req.body.sizes || "[]");
    const parsedPacks = JSON.parse(req.body.packs || "[]");
    const parsedPriceMatrix = JSON.parse(req.body.priceMatrix || "[]");
    const parsedHighlights = JSON.parse(req.body.highlights || "[]");
    const parsedExistingImages = JSON.parse(req.body.existingImages || "[]");

    let uploadedImages = [];

    // Upload new images if any
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "bulk_products" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        uploadedImages.push(result.secure_url);
      }
    }

    // Merge existing + new images
    const finalImages = [...parsedExistingImages, ...uploadedImages];

    const updatedProduct = await BulkProduct.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        amazonLink,
        description,
        sizes: parsedSizes,
        packs: parsedPacks,
        priceMatrix: parsedPriceMatrix,
        highlights: parsedHighlights,
        images: finalImages,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Bulk Product Updated Successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Error in updateBulkProduct:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE
export const deleteBulkProduct = async (req, res) => {
  try {
    await BulkProduct.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteBulkProduct:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};