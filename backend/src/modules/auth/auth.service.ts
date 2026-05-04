import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./user.model";
import { RegisterDTO, LoginDTO } from "./auth.dto";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const registerUser = async (data: RegisterDTO) => {
  const { name, email, password, role } = data;

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
    role: role || "member", // 👈 THIS IS THE KEY CHANGE
  });

  const { password: _, ...userObj } = user.toObject();

  // Generate token so they are logged in automatically
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    user: userObj,
    token,
  };
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

export const searchUserByEmail = async (email: string) => {
  const user = await User.findOne({ email }).select("name email _id");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};