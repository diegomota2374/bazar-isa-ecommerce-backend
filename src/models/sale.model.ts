import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
  clientId: mongoose.Schema.Types.ObjectId;
  productId: mongoose.Schema.Types.ObjectId;
  status: string;
  saleDate: Date;
}

const SaleSchema: Schema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  status: { type: String, enum: ["cancel", "finish", "stay"], required: true },
  saleDate: { type: Date, default: Date.now },
});

export const Sale = mongoose.model<ISale>("Sale", SaleSchema);
