import express from "express";
import multer from "multer";
import { addProduct, getProducts, getProduct, updateProduct, deleteProduct} from "../controllers/productController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// CRUD
// CRUD routes
router.post("/", upload.array("images", 10), addProduct);

// GET all OR filtered products by category
router.get("/", getProducts);

// GET single product by ID
router.get("/:id", getProduct);

// Update product
router.put("/:id", upload.array("images", 10), updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

export default router;