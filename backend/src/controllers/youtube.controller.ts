import { Request, Response } from "express";
import { Provider } from "../models/Provider.js";
import {
  exchangeCodeForYTToken,
  getYoutubeChannel,
} from "../services/youtubeService.js";

const SERVER_ROOT = process.env.SERVER_ROOT_URL!;
const FRONTEND_ROOT = process.env.FRONTEND_ROOT_URL!;
const CLIENT_ID_GOOGLE = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET_GOOGLE = process.env.GOOGLE_CLIENT_SECRET!;

// Redirect user to Google OAuth
export const connectYouTube = (req: Request, res: Response) => {
  const userId = req.query.userId as string; // get from frontend
  if (!userId) return res.status(400).send("Missing userId");

  const redirectUri = `${SERVER_ROOT}/api/provider/youtube/callback`;
  const scope = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
  ].join(" ");

  const state = JSON.stringify({ userId });

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID_GOOGLE}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline&prompt=consent` +
    `&state=${encodeURIComponent(state)}`;

  return res.redirect(url);
};

// OAuth callback from Google
export const youtubeCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state ? JSON.parse(req.query.state as string) : null;
    if (!code || !state?.userId) return res.status(400).send("Missing code or state");

    const userId = state.userId;
    const redirectUri = `${SERVER_ROOT}/api/provider/youtube/callback`;

    const tokenData = await exchangeCodeForYTToken({
      code,
      client_id: CLIENT_ID_GOOGLE,
      client_secret: CLIENT_SECRET_GOOGLE,
      redirect_uri: redirectUri,
    });

    const channelId = await getYoutubeChannel({
      access_token: tokenData.access_token,
    });

    // Save provider data in DB
    const providerData = await Provider.findOneAndUpdate(
      { user: userId, provider: "youtube" },
      {
        provider: "youtube",
        user: userId,
        providerId: userId.toString(),
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        channelId,
      },
      { upsert: true, new: true }
    );

    // ✅ Send the saved data back to frontend instead of redirecting
    return res.redirect(`${FRONTEND_ROOT}/dashboard?connected=youtube`);
  } catch (err: any) {
    console.error("YouTube OAuth error:", err.response?.data || err.message);
    return res.status(500).send("YouTube OAuth callback failed");
  }
};
