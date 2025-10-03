import { Router, Request, Response } from "express";
import { Provider } from "../models/Provider.js";

export const getProviders = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const providers = await Provider.find({ user: userId });
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch providers" });
  }
}