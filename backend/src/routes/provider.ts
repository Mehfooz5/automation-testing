// routes/provider.ts
import { Router } from "express";
import {
  connectYouTube,
  youtubeCallback,
} from "../controllers/youtube.controller.js";
import {
  connectFacebook,
  facebookCallback,
} from "../controllers/facebook.controller.js";
import { getProviders } from "../controllers/providerController.js";
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// YouTube
router.get("/youtube/connect",  connectYouTube);
router.get("/youtube/callback",  youtubeCallback);

// Facebook / Instagram
router.get("/facebook/connect",  connectFacebook);
router.get("/facebook/callback", facebookCallback);

router.get("/connected", authenticateToken,  getProviders);

export default router;
