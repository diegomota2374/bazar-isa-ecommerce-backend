import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IClient extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const ClientSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Antes de salvar, criptografar a senha
ClientSchema.pre<IClient>("save", async function (next) {
  const client = this;
  if (!client.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(client.password, salt);
  client.password = hash;

  next();
});

// Método para comparar a senha
ClientSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Client = mongoose.model<IClient>("Client", ClientSchema);
