import express from "express";
import { connectProvider, providerCallback } from "../controllers/providerController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:provider", authenticateToken, connectProvider);
router.get("/:provider/callback", authenticateToken, providerCallback);

export default router;
