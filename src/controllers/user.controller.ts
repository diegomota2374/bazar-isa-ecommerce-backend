import { Request, Response } from "express";
import { User } from "../models/user.model"; // Import User model
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Replace with your secret

// Create a new user
const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error });
  }
};

// Authenticate a user and return a JWT
const authenticateUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and return a JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error authenticating user", error });
  }
};

// Get all users
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users", error });
  }
};

// Get a single user by ID
const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user", error });
  }
};

// Update a user by ID
const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    if (updates.password) {
      // Hash the new password before saving
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: "Error updating user", error });
  }
};

// Delete a user by ID
const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error });
  }
};

export {
  createUser,
  authenticateUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
