// services/youtubeService.ts
import axios, { AxiosResponse } from "axios";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_CHANNELS_URL = "https://www.googleapis.com/youtube/v3/channels";

interface YoutubeTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface YoutubeChannelResponse {
  items: Array<{
    id: string;
  }>;
}

export async function exchangeCodeForYTToken({
  code,
  client_id,
  client_secret,
  redirect_uri,
}: {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}): Promise<YoutubeTokenResponse> {
  const res: AxiosResponse<YoutubeTokenResponse> = await axios.post(
    GOOGLE_TOKEN_URL,
    null,
    {
      params: {
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code",
      },
    }
  );
  return res.data;
}

export async function getYoutubeChannel({
  access_token,
}: {
  access_token: string;
}): Promise<string | null> {
  const res: AxiosResponse<YoutubeChannelResponse> = await axios.get(
    YOUTUBE_CHANNELS_URL,
    {
      params: { part: "id", mine: true },
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );

  return res.data.items[0]?.id || null;
}
