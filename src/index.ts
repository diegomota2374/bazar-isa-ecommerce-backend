import express from "express";
import cors from "cors";
import connectDB from "./utils/db";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import saleRoutes from "./routes/sale.routes";
import userRoutes from "./routes/user.routes";
import clientRoutes from "./routes/client.routes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);

// Example route
app.get("/", (req, res) => {
  res.send("Bazar ISA Backend is running");
});

// Connect DB
connectDB();

export default app;
