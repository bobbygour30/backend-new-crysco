import BulkProduct from "../models/BulkProduct.js";
import cloudinary from "../config/cloudnary.js";

// CREATE
export const createBulkProduct = async (req, res) => {
  try {
    const { title, category, variants, amazonLink, description, highlights } =
      req.body;

    const parsedVariants = JSON.parse(variants);
    const parsedHighlights = JSON.parse(highlights);

    // Upload images to Cloudinary
    const imageUploads = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload_stream(
          { folder: "bulk_products" },
          (error, result) => {
            if (error) throw error;
            return result;
          }
        )
      )
    );

    // Because upload_stream works differently, we need buffer logic
    const uploadedImages = [];

    for (let file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "bulk_products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
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
    res.status(500).json({ message: error.message });
  }
};



// GET ALL
export const getBulkProducts = async (req, res) => {
  try {
    const products = await BulkProduct.find(); // Or whatever model you use
    res.json(products);
  } catch (error) {
    console.error("Error fetching bulk products:", error); // <- log error
    res.status(500).json({ message: "Server Error" });
  }
};



// GET SINGLE
export const getBulkProductById = async (req, res) => {
  try {
    const product = await BulkProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE
export const updateBulkProduct = async (req, res) => {
  try {
    const { title, category, variants, amazonLink, description, highlights } =
      req.body;

    const parsedVariants = JSON.parse(variants);
    const parsedHighlights = JSON.parse(highlights);

    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "bulk_products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
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

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE
export const deleteBulkProduct = async (req, res) => {
  try {
    await BulkProduct.findByIdAndDelete(req.params.id);
    res.json({ message: "Bulk Product Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};