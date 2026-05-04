import { Request, Response } from "express";
import * as authService from "./auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    const status = error.message === "Invalid credentials" ? 401 : 400;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    const user = await authService.searchUserByEmail(email as string);

    res.status(200).json({
      success: true,
      message: "User found",
      data: user,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    const status = error.message === "Invalid credentials" ? 401 : 400;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};