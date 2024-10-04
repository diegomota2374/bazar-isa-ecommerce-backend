import express from "express";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  checkEmailExists,
  loginClient,
  forgotPassword,
  resetPassword,
} from "../controllers/client.controller";

const router = express.Router();

// Rota para criar um novo cliente
router.post("/", createClient);

// Rota para se logar
router.post("/login", loginClient);

// Rota para obter todos os clientes
router.get("/", getClients);

// Rota para obter um cliente pelo ID
router.get("/:id", getClientById);

// Rota para atualizar um cliente pelo ID
router.put("/:id", updateClient);

// Rota para deletar um cliente pelo ID
router.delete("/:id", deleteClient);

// Nova rota para verificar se o email já existe
router.post("/check-email-client", checkEmailExists);

// Rota para solicitação de redefinição de senha
router.post("/forgot-password", forgotPassword);

// Rota para redefinição de senha
router.post("/reset-password/:token", resetPassword);

export default router;
