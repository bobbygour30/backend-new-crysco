import BulkProduct from "../models/BulkProduct.js";
import cloudinary from "../config/cloudnary.js";

// ✅ CREATE BULK PRODUCT
export const createBulkProduct = async (req, res) => {
  try {
    const { title, category, variants, amazonLink, description, highlights } = req.body;

    const parsedVariants = JSON.parse(variants || "[]");
    const parsedHighlights = JSON.parse(highlights || "[]");

    const uploadedImages = [];

    // ✅ Upload images to Cloudinary
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
      variants: parsedVariants,
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
    const products = await BulkProduct.find(); // Fetch products from the database
    res.status(200).json(products); // Respond with products
  } catch (error) {
    console.error("❌ Error in getBulkProducts:", error); // Log the error details
    res.status(500).json({ message: "Server error", error: error.message }); // Send detailed error message to client
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

// ✅ UPDATE
export const updateBulkProduct = async (req, res) => {
  try {
    const { title, category, variants, amazonLink, description, highlights } = req.body;

    const parsedVariants = JSON.parse(variants || "[]");
    const parsedHighlights = JSON.parse(highlights || "[]");

    let uploadedImages = [];

    // ✅ Optional new image upload
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

    const updated = await BulkProduct.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        variants: parsedVariants,
        amazonLink,
        description,
        highlights: parsedHighlights,
        ...(uploadedImages.length > 0 && { images: uploadedImages }),
      },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Error in updateBulkProduct:", error.message);
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