import * as express from "express";

// Defina a interface para o payload do usuário (ajuste conforme necessário)
interface UserPayload {
  id: string;
  email?: string;
  // Adicione outras propriedades do usuário conforme necessário
}

// Extenda a interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; // `user` pode ser undefined
    }
  }
}
