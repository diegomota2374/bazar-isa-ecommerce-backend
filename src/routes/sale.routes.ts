import express from "express";
import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
} from "../controllers/sale.controller";

const router = express.Router();

// Route to create a new sale
router.post("/", createSale);

// Route to get all sales
router.get("/", getAllSales);

// Route to get a single sale by ID
router.get("/:id", getSaleById);

// Route to update a sale by ID
router.put("/:id", updateSale);

// Route to delete a sale by ID
router.delete("/:id", deleteSale);

export default router;
