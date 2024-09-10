import { Request, Response } from "express";
import { Client } from "../models/client.model"; // Importar o modelo de Client

// Criar um novo cliente
export const createClient = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, email, phoneNumber, address } = req.body;

    // Verificar se o cliente já existe pelo email
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: "Cliente já existe." });
    }

    // Criar um novo cliente
    const newClient = new Client({
      name,
      email,
      phoneNumber,
      address,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newClient.save();
    return res.status(201).json(newClient);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar cliente.", error });
  }
};

// Obter todos os clientes
export const getClients = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const clients = await Client.find();
    return res.status(200).json(clients);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter clientes.", error });
  }
};

// Obter um cliente por ID
export const getClientById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    return res.status(200).json(client);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter cliente.", error });
  }
};

// Atualizar um cliente por ID
export const updateClient = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, address } = req.body;

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phoneNumber,
        address,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    return res.status(200).json(updatedClient);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao atualizar cliente.", error });
  }
};

// Excluir um cliente por ID
export const deleteClient = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const deletedClient = await Client.findByIdAndDelete(id);

    if (!deletedClient) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    return res.status(200).json({ message: "Cliente excluído com sucesso." });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao excluir cliente.", error });
  }
};
