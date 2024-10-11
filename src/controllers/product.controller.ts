import { Request, Response } from "express";
import { Product } from "../models/product.model";
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid"; // Para criar identificadores únicos para as imagens

// Configurando o cliente S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Configurar o armazenamento com multer-s3 para fazer o upload direto para o S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME!, // Nome do bucket no S3

    key: (req: Request, file: Express.Multer.File, cb) => {
      // Gerar um nome de arquivo único
      const fileName = `${uuidv4()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

// Função para criar um novo produto com imagem
const createProduct = async (req: Request, res: Response) => {
  const { name, description, status, category, state, price, size, discount } =
    req.body;

  // Verifica se todos os campos obrigatórios estão presentes
  if (
    !name ||
    !description ||
    !status ||
    !category ||
    !state ||
    !price ||
    !size
  ) {
    return res
      .status(400)
      .json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  try {
    // URL da imagem no S3
    let imgProductUrl = "";
    if (req.file) {
      imgProductUrl = (req.file as any).location; // A URL pública da imagem armazenada no S3
    }

    // Criar o novo produto com a URL da imagem
    const newProduct = new Product({
      name,
      description,
      status,
      category,
      state,
      price,
      size,
      discount,
      imgProduct: imgProductUrl, // Armazena a URL da imagem
    });

    await newProduct.save();
    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(500).json({ message: "Error creating product", error });
  }
};

// Outras funções de CRUD (não mudam)
const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching products", error });
  }
};

const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching product", error });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const file = req.file; // A nova imagem, caso enviada

  try {
    // Encontrar o produto no banco de dados pelo ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    // Se uma nova imagem foi enviada, substituir a antiga
    if (file) {
      const oldImageUrl = product.imgProduct;

      if (oldImageUrl) {
        const oldImageKey = oldImageUrl.split("/").pop(); // Extrair a chave da imagem antiga

        // Deletar a imagem antiga no S3, se a chave for válida
        if (oldImageKey) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: oldImageKey,
              })
            );
          } catch (deleteError) {
            // Verificar se o erro é uma instância de Error
            if (deleteError instanceof Error) {
              return res.status(500).json({
                message: "Erro ao excluir a imagem antiga do S3",
                error: deleteError.message,
              });
            }
            // Caso contrário, retornar uma mensagem genérica
            return res.status(500).json({
              message: "Erro desconhecido ao excluir a imagem antiga do S3",
            });
          }
        }
      }

      //Verificar se o arquivo não está vazio
      if (!file.buffer || file.size === 0) {
        return res.status(400).json({
          message: "O arquivo da nova imagem está vazio ou corrompido",
        });
      }

      // Fazer upload da nova imagem no S3
      const newImageKey = `${uuidv4()}-${file.originalname}`;
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: newImageKey,
        Body: file.buffer, // Buffer de memória se o multer estiver configurado dessa forma
        ContentType: file.mimetype,
      };

      try {
        await s3.send(new PutObjectCommand(uploadParams));
        // Atualizar o campo imageUrl com a nova URL da imagem
        updates.imgProduct = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${newImageKey}`;
      } catch (uploadError) {
        // Verificar se o erro é uma instância de Error
        if (uploadError instanceof Error) {
          return res.status(500).json({
            message: "Erro ao fazer upload da nova imagem para o S3",
            error: uploadError.message,
          });
        }
        // Caso contrário, retornar uma mensagem genérica
        return res.status(500).json({
          message: "Erro desconhecido ao fazer upload da nova imagem para o S3",
        });
      }
    }

    // Atualizar o produto no banco de dados
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    // Retornar o produto atualizado como resposta
    return res.json(updatedProduct);
  } catch (error) {
    // Verificar se o erro é uma instância de Error
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Erro ao atualizar o produto",
        error: error.message,
      });
    }
    // Caso contrário, retornar uma mensagem genérica
    return res.status(500).json({
      message: "Erro desconhecido ao atualizar o produto",
    });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Primeiro, encontre o produto para obter a URL da imagem
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Pegue a URL da imagem armazenada no produto (ou a chave do S3)
    const imageUrl = product.imgProduct; // Supondo que o campo da URL da imagem seja `imageUrl`

    if (!imageUrl) {
      return;
    }

    const imageKey = imageUrl.split("/").pop();

    // Delete a imagem no S3
    if (imageKey) {
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME, // Insira o nome do seu bucket S3
        Key: imageKey,
      };

      // Usando o DeleteObjectCommand para deletar a imagem
      await s3.send(new DeleteObjectCommand(deleteParams));
    }
    // Agora, delete o produto do banco de dados
    const deletedProduct = await Product.findByIdAndDelete(id);

    return res.json({ message: "Product and image deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting product", error });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  upload,
};
