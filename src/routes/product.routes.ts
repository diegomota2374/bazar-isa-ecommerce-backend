import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  upload,
} from "../controllers/product.controller";

import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage(); // Armazenar na memória
const uploadEdit = multer({ storage });

// Route to create a new product
router.post("/", upload.single("imgProduct"), createProduct);

// Route to get all products
router.get("/", getAllProducts);

// Route to get a single product by ID
router.get("/:id", getProductById);

// Route to update a product by ID
router.put("/:id", uploadEdit.single("imgProduct"), updateProduct);

// Route to delete a product by ID
router.delete("/:id", deleteProduct);

export default router;
