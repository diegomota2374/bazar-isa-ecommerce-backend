import { Request, Response } from "express";
import { Client } from "../models/client.model"; // Mock do modelo
import { createClient } from "../controllers/client.controller";

// Mock do Mongoose
jest.mock("../models/client.model");

describe("Client Controller", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Limpar mocks após cada teste
  });

  it("deve criar um novo cliente com sucesso", async () => {
    // Mock da requisição e resposta
    const req = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        phoneNumber: "123456789",
        address: "123 Street, City",
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Mock do método save do modelo Client
    (Client.prototype.save as jest.Mock).mockResolvedValueOnce(req.body);

    await createClient(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(201); // Verifica se retornou o status 201
    expect(res.json).toHaveBeenCalledWith(req.body); // Verifica se retornou o cliente criado
  });

  it("deve retornar erro ao tentar criar cliente duplicado", async () => {
    // Mock da requisição e resposta
    const req = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        phoneNumber: "123456789",
        address: "123 Street, City",
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Mock do método findOne para simular cliente já existente
    (Client.findOne as jest.Mock).mockResolvedValueOnce(req.body);

    await createClient(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400); // Verifica se retornou o status 400
    expect(res.json).toHaveBeenCalledWith({ message: "Cliente já existe." });
  });
});
