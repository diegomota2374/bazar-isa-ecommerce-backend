import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  status: "available" | "unavailable";
  category: string;
  state: string;
  price: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["available", "unavailable"], required: true },
  category: { type: String, required: true },
  state: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
