import { Request, Response } from "express";
import axios from "axios";
import { Provider } from "../models/Provider.js";

const FB_API = process.env.FB_API_VERSION || "v20.0";
const SERVER_ROOT = process.env.SERVER_ROOT_URL;
const FRONTEND_ROOT = process.env.FRONTEND_ROOT_URL;
const CLIENT_ID_FB = process.env.FB_APP_ID;
const CLIENT_SECRET_FB = process.env.FB_APP_SECRET;
const CLIENT_ID_GOOGLE = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET_GOOGLE = process.env.GOOGLE_CLIENT_SECRET;

export const connectProvider = (req: Request, res: Response) => {
  const provider = req.params.provider;

  if (provider === "youtube") {
    const redirectUri = `${SERVER_ROOT}/api/provider/youtube/callback`;
    const scope = [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly"
    ].join(" ");

    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${CLIENT_ID_GOOGLE}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline&prompt=consent`;

    return res.redirect(url);
  }

  if (provider === "facebook") {
    const redirectUri = `${SERVER_ROOT}/api/provider/facebook/callback`;
    const scope = [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "instagram_basic",
      "instagram_content_publish",
      "publish_video",
      "business_management"
    ].join(",");

    const url = `https://www.facebook.com/${FB_API}/dialog/oauth?` +
      `client_id=${CLIENT_ID_FB}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scope}` +
      `&response_type=code&auth_type=rerequest`;

    return res.redirect(url);
  }

  return res.status(400).json({ error: "Unsupported provider" });
};

export const providerCallback = async (req: Request, res: Response) => {
  try {
    const provider = req.params.provider;
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Missing code");

    const userId = (req.user as any)._id; // from JWT auth middleware

    if (provider === "youtube") {
      const redirectUri = `${SERVER_ROOT}/api/provider/youtube/callback`;

      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", null, {
        params: {
          code,
          client_id: CLIENT_ID_GOOGLE,
          client_secret: CLIENT_SECRET_GOOGLE,
          redirect_uri: redirectUri,
          grant_type: "authorization_code"
        }
      });

      const { access_token, refresh_token, expires_in } = tokenRes.data;

      // get channel info
      const channelRes = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
        params: { part: "id", mine: true },
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const channelId = channelRes.data.items[0]?.id;

      await Provider.findOneAndUpdate(
        { user: userId, provider: "youtube" },
        {
          provider: "youtube",
          user: userId,
          providerId: userId.toString(),
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
          channelId
        },
        { upsert: true, new: true }
      );

      return res.redirect(`${FRONTEND_ROOT}/dashboard?connected=youtube`);
    }

    if (provider === "facebook") {
      const redirectUri = `${SERVER_ROOT}/api/provider/facebook/callback`;

      // Step 1: get short-lived token
      const tokenRes = await axios.get(`https://graph.facebook.com/${FB_API}/oauth/access_token`, {
        params: {
          client_id: CLIENT_ID_FB,
          client_secret: CLIENT_SECRET_FB,
          redirect_uri: redirectUri,
          code
        }
      });

      const shortToken = tokenRes.data.access_token;

      // Step 2: long-lived token
      const longRes = await axios.get(`https://graph.facebook.com/${FB_API}/oauth/access_token`, {
        params: {
          grant_type: "fb_exchange_token",
          client_id: CLIENT_ID_FB,
          client_secret: CLIENT_SECRET_FB,
          fb_exchange_token: shortToken
        }
      });

      const longToken = longRes.data.access_token;

      // Step 3: get user profile
      const profileRes = await axios.get(`https://graph.facebook.com/me`, {
        params: { access_token: longToken, fields: "id,name" }
      });

      const profile = profileRes.data;

      // Step 4: get user pages
      const pagesRes = await axios.get(`https://graph.facebook.com/me/accounts`, {
        params: { access_token: longToken }
      });

      const pages = pagesRes.data.data || [];

      // Step 5: find Instagram Business Account
      let igUserId: string | null = null;
      for (const p of pages) {
        if (!p.access_token) continue;
        try {
          const igRes = await axios.get(`https://graph.facebook.com/${p.id}`, {
            params: { fields: "instagram_business_account", access_token: p.access_token }
          });
          if (igRes.data.instagram_business_account?.id) {
            igUserId = igRes.data.instagram_business_account.id;
            break;
          }
        } catch (err: any) {
          console.error("IG fetch error:", err.response?.data || err.message);
        }
      }

      await Provider.findOneAndUpdate(
        { user: userId, provider: "facebook" },
        {
          provider: "facebook",
          user: userId,
          providerId: profile.id,
          accessToken: longToken,
          pages,
          igUserId
        },
        { upsert: true, new: true }
      );

      return res.redirect(`${FRONTEND_ROOT}/dashboard?connected=facebook`);
    }

    return res.status(400).send("Unsupported provider");
  } catch (err: any) {
    console.error("OAuth callback error:", err.response?.data || err.message);
    return res.status(500).send("OAuth callback failed");
  }
};
