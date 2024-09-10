import { Request, Response } from "express";
import { Sale } from "../models/sale.model";
import { Product } from "../models/product.model";
import { Client } from "../models/client.model";

// Create a new sale
const createSale = async (req: Request, res: Response) => {
  const { clientId, productId, status } = req.body;
  try {
    // Check if the client and product exist
    const client = await Client.findById(clientId);
    const product = await Product.findById(productId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newSale = new Sale({
      clientId,
      productId,
      status,
    });

    await newSale.save();
    return res.status(201).json(newSale);
  } catch (error) {
    return res.status(500).json({ message: "Error creating sale", error });
  }
};

// Get all sales
const getAllSales = async (req: Request, res: Response) => {
  try {
    const sales = await Sale.find()
      .populate("clientId", "name email") // Populate client details
      .populate("productId", "name price"); // Populate product details

    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching sales", error });
  }
};

// Get a single sale by ID
const getSaleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const sale = await Sale.findById(id)
      .populate("clientId", "name email")
      .populate("productId", "name price");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    return res.json(sale);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching sale", error });
  }
};

// Update a sale by ID
const updateSale = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updatedSale = await Sale.findByIdAndUpdate(id, updates, { new: true })
      .populate("clientId", "name email")
      .populate("productId", "name price");

    if (!updatedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    return res.json(updatedSale);
  } catch (error) {
    return res.status(500).json({ message: "Error updating sale", error });
  }
};

// Delete a sale by ID
const deleteSale = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedSale = await Sale.findByIdAndDelete(id);

    if (!deletedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    return res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting sale", error });
  }
};

export { createSale, getAllSales, getSaleById, updateSale, deleteSale };
