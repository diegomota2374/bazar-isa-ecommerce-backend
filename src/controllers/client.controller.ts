import { Request, Response } from "express";
import { Client } from "../models/client.model";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import crypto from "crypto";
import mongoose from "mongoose";

const JWT_SECRET = "seu_segredo_aqui";
const urlBase = process.env.URL_BASE_FRONTEND;

// Função para gerar tokens aleatórios
const randomBytesAsync = promisify(crypto.randomBytes);

// Configuração do Nodemailer (usar com SMTP ou outro serviço de email)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Função para enviar o e-mail de recuperação de senha
const sendResetEmail = async (email: string, token: string) => {
  const resetLink = `${urlBase}/ResetPassword?token=${token}`; // Substitua pelo seu domínio
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Redefinição de Senha",
    text: `Você solicitou a redefinição de senha. Use o link abaixo para redefinir sua senha:\n\n${resetLink}`,
  };

  await transporter.sendMail(mailOptions);
};

// Função para lidar com a solicitação de redefinição de senha
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    // Verificar se o cliente existe
    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    // Gerar token de redefinição de senha
    const token = (await randomBytesAsync(20)).toString("hex");
    const tokenExpires = Date.now() + 3600000; // Expira em 1 hora

    // Atualizar o cliente com o token e sua data de expiração
    client.resetPasswordToken = token;
    client.resetPasswordExpires = tokenExpires;

    // Salvar cliente sem validar campos obrigatórios como a senha
    await client.save({ validateBeforeSave: false });

    // Enviar email com o link de redefinição
    await sendResetEmail(email, token);

    return res.status(200).json({ message: "Email de recuperação enviado." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao solicitar redefinição de senha.", error });
  }
};

// Função para redefinir a senha
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Encontrar o cliente pelo token de redefinição de senha e verificar se o token ainda é válido
    const client = await Client.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Verifica se o token não expirou
    });

    if (!client) {
      return res.status(400).json({ message: "Token inválido ou expirado." });
    }

    // Atualizar a senha do cliente
    client.password = newPassword;
    client.resetPasswordToken = undefined;
    client.resetPasswordExpires = undefined;

    await client.save();

    return res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao redefinir senha.", error });
  }
};

export const checkEmailExists = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(200).json({ exists: true });
    }
    return res.status(200).json({ exists: false });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao verificar email.", error });
  }
};

// Criar um novo cliente
export const createClient = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, email, phoneNumber, address, password } = req.body;

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
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newClient.save();

    const token = jwt.sign({ id: newClient._id }, JWT_SECRET, {
      expiresIn: "3h",
    });

    return res.status(201).json({ token, client: newClient });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar cliente.", error });
  }
};

// Login (Autenticação)
export const loginClient = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Verificar se o cliente existe
    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    // Verificar se a senha está correta
    const isMatch = await client.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Senha incorreta." });
    }

    // Gerar um token JWT
    const token = jwt.sign({ id: client._id }, JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({ token, client });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao autenticar.", error });
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

export const getFavorite = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const clientId = req.user.id; // O ID do cliente vem do token JWT
    const client = await Client.findById(clientId).populate("favorites");
    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    // Retorna todos os produtos favoritos
    return res.status(200).json(client.favorites);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter favoritos.", error });
  }
};

export const getFavoriteProducts = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const clientId = req.user.id; // O ID do cliente vem do token JWT
    const { productId } = req.params; // O ID do produto vem dos parâmetros da URL

    // Converte o productId para ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID do produto inválido." });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const client = await Client.findById(clientId); // Busca o cliente pelo ID

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    // Verifica se o produto está na lista de favoritos do cliente
    const isFavorited = client.favorites.some(
      (favoriteId) => favoriteId.toString() === productObjectId.toString() // Usa o método `equals` para comparar ObjectIds
    );

    return res.status(200).json({ isFavorited });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao verificar favoritos.", error });
  }
};

// Adicionar um produto aos favoritos
export const addFavoriteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const clientId = req.user.id;

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    // Verificar se o produto já está na lista de favoritos
    if (client.favorites.includes(productId)) {
      return res
        .status(400)
        .json({ message: "Este produto já está na lista de favoritos" });
    }

    // Adicionar o produto à lista de favoritos
    client.favorites.push(productId);
    await client.save();

    return res
      .status(200)
      .json({ message: "Produto adicionado aos favoritos" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao adicionar favorito", error });
  }
};

// Remover um produto dos favoritos
export const removeFavoriteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const clientId = req.user.id; // Supondo que o ID do cliente está no token JWT

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    // Remover o produto da lista de favoritos
    client.favorites = client.favorites.filter(
      (favProductId) => favProductId.toString() !== productId
    );
    await client.save();

    return res.status(200).json({ message: "Produto removido dos favoritos" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao remover favorito", error });
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
