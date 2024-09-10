import express from "express";
import {
  createUser,
  authenticateUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

const router = express.Router();

// Route to create a new user
router.post("/", createUser);

// Route to authenticate a user and get a JWT
router.post("/authenticate", authenticateUser);

// Route to get all users
router.get("/", getAllUsers);

// Route to get a single user by ID
router.get("/:id", getUserById);

// Route to update a user by ID
router.put("/:id", updateUser);

// Route to delete a user by ID
router.delete("/:id", deleteUser);

export default router;
