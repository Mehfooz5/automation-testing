import { Request, Response } from "express";
import { Provider } from "../models/Provider.js";
import {
  exchangeCodeForShortToken,
  exchangeForLongLivedToken,
  getUserProfile,
  getUserPages,
  getInstagramBusinessAccount,
} from "../services/instagramService.js";

const FB_API = process.env.FB_API_VERSION || "v20.0";
const SERVER_ROOT = process.env.SERVER_ROOT_URL!;
const CLIENT_ID_FB = process.env.FB_APP_ID!;
const CLIENT_SECRET_FB = process.env.FB_APP_SECRET!;
const FRONTEND_ROOT = process.env.FRONTEND_ROOT_URL

// Redirect user to Facebook OAuth
export const connectFacebook = (req: Request, res: Response) => {
  const userId = req.query.userId as string; // get from frontend
  if (!userId) return res.status(400).send("Missing userId");

  const redirectUri = `${SERVER_ROOT}/api/provider/facebook/callback`;
  const scope = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_metadata",
    "instagram_basic",
    "instagram_content_publish",
    "publish_video",
    "business_management",
  ].join(",");

  // put userId in state
  const state = JSON.stringify({ userId });

  const url =
    `https://www.facebook.com/${FB_API}/dialog/oauth?` +
    `client_id=${CLIENT_ID_FB}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scope}` +
    `&response_type=code&auth_type=rerequest` +
    `&state=${encodeURIComponent(state)}`;

  return res.redirect(url);
};

// OAuth callback from Facebook
export const facebookCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state ? JSON.parse(req.query.state as string) : null;
    if (!code || !state?.userId) return res.status(400).send("Missing code or state");

    const userId = state.userId;
    const redirectUri = `${SERVER_ROOT}/api/provider/facebook/callback`;

    // Step 1: Short-lived token
    const shortTokenRes = await exchangeCodeForShortToken({
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID_FB,
      client_secret: CLIENT_SECRET_FB,
    });

    // Step 2: Long-lived token
    const longTokenRes = await exchangeForLongLivedToken({
      short_lived_token: shortTokenRes.access_token,
      client_id: CLIENT_ID_FB,
      client_secret: CLIENT_SECRET_FB,
    });

    // Step 3: User profile
    const profile = await getUserProfile({
      access_token: longTokenRes.access_token,
    });

    // Step 4: User pages
    const pages = (await getUserPages({
      access_token: longTokenRes.access_token,
    })).data || [];

    // Step 5: Instagram Business Account
    let igUserId: string | null = null;
    for (const p of pages) {
      if (!p.access_token) continue;
      try {
        const igRes = await getInstagramBusinessAccount({
          page_id: p.id,
          page_access_token: p.access_token,
        });
        if (igRes.instagram_business_account?.id) {
          igUserId = igRes.instagram_business_account.id;
          break;
        }
      } catch (err: any) {
        console.error("IG fetch error:", err.response?.data || err.message);
      }
    }

    // Save provider data in DB
    const providerData = await Provider.findOneAndUpdate(
      { user: userId, provider: "facebook" },
      {
        provider: "facebook",
        user: userId,
        providerId: profile.id,
        accessToken: longTokenRes.access_token,
        pages,
        igUserId,
      },
      { upsert: true, new: true }
    );

    // ✅ Send the saved data back to frontend instead of redirecting
    return res.redirect(`${FRONTEND_ROOT}/dashboard?connected=facebook`);

  } catch (err: any) {
    console.error("Facebook OAuth error:", err.response?.data || err.message);
    return res.status(500).send("Facebook OAuth callback failed");
  }
};
