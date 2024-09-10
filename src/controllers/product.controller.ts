import { Request, Response } from "express";
import { Product } from "../models/product.model";

// Create a new product
const createProduct = async (req: Request, res: Response) => {
  const { name, description, status, category, state, price, discount } =
    req.body;
  try {
    const newProduct = new Product({
      name,
      description,
      status,
      category,
      state,
      price,
      discount,
    });
    await newProduct.save();
    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(500).json({ message: "Error creating product", error });
  }
};

// Get all products
const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching products", error });
  }
};

// Get a single product by ID
const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching product", error });
  }
};

// Update a product by ID
const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ message: "Error updating product", error });
  }
};

// Delete a product by ID
const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting product", error });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
