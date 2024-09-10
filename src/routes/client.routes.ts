import express from "express";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/client.controller";

const router = express.Router();

// Rota para criar um novo cliente
router.post("/", createClient);

// Rota para obter todos os clientes
router.get("/", getClients);

// Rota para obter um cliente pelo ID
router.get("/:id", getClientById);

// Rota para atualizar um cliente pelo ID
router.put("/:id", updateClient);

// Rota para deletar um cliente pelo ID
router.delete("/:id", deleteClient);

export default router;
