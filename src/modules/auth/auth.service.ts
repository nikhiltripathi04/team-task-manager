import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./user.model";
import { RegisterDTO, LoginDTO } from "./auth.dto";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const registerUser = async (data: RegisterDTO) => {
  const { name, email, password } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const { password: _, ...userObj } = user.toObject();
  return userObj;
};

export const loginUser = async (data: LoginDTO) => {
  const { email, password } = data;

  // Check user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Generate token
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const { password: _, ...userObj } = user.toObject();

  return {
    user: userObj,
    token,
  };
};