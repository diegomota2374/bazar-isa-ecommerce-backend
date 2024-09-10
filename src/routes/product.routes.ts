import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

const router = express.Router();

// Route to create a new product
router.post("/", createProduct);

// Route to get all products
router.get("/", getAllProducts);

// Route to get a single product by ID
router.get("/:id", getProductById);

// Route to update a product by ID
router.put("/:id", updateProduct);

// Route to delete a product by ID
router.delete("/:id", deleteProduct);

export default router;
