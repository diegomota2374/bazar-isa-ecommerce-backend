import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  name: string;
  email: string;
  phoneNumber: Number;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: Number, required: true },
  address: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Client = mongoose.model<IClient>("Client", ClientSchema);
