// services/instagramService.ts
import axios, { AxiosResponse } from 'axios';

const FB_API: string = process.env.FB_API_VERSION || 'v20.0';
const FB_BASE = (path: string): string => `https://graph.facebook.com/${FB_API}${path}`;

interface ShortLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface LongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface UserProfile {
  id: string;
  name: string;
}

interface UserPagesResponse {
  data: Array<{
    id: string;
    name: string;
    access_token: string;
    [key: string]: any;
  }>;
}

interface InstagramBusinessAccountResponse {
  instagram_business_account?: {
    id: string;
  };
  [key: string]: any;
}

interface MediaContainerResponse {
  id: string;
}

interface PublishMediaResponse {
  id: string;
}

export async function exchangeCodeForShortToken({
  code,
  redirect_uri,
  client_id,
  client_secret,
}: {
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}): Promise<ShortLivedTokenResponse> {
  const res: AxiosResponse<ShortLivedTokenResponse> = await axios.get(
    `${FB_BASE('/oauth/access_token')}`,
    {
      params: { client_id, redirect_uri, client_secret, code },
    }
  );
  return res.data;
}

export async function exchangeForLongLivedToken({
  short_lived_token,
  client_id,
  client_secret,
}: {
  short_lived_token: string;
  client_id: string;
  client_secret: string;
}): Promise<LongLivedTokenResponse> {
  const res: AxiosResponse<LongLivedTokenResponse> = await axios.get(
    `${FB_BASE('/oauth/access_token')}`,
    {
      params: {
        grant_type: 'fb_exchange_token',
        client_id,
        client_secret,
        fb_exchange_token: short_lived_token,
      },
    }
  );
  return res.data;
}

export async function getUserProfile({
  access_token,
}: {
  access_token: string;
}): Promise<UserProfile> {
  const res: AxiosResponse<UserProfile> = await axios.get(`${FB_BASE('/me')}`, {
    params: { access_token, fields: 'id,name' },
  });
  return res.data;
}

export async function getUserPages({
  access_token,
}: {
  access_token: string;
}): Promise<UserPagesResponse> {
  const res: AxiosResponse<UserPagesResponse> = await axios.get(
    `${FB_BASE('/me/accounts')}`,
    {
      params: { access_token },
    }
  );
  return res.data;
}

export async function getInstagramBusinessAccount({
  page_id,
  page_access_token,
}: {
  page_id: string;
  page_access_token: string;
}): Promise<InstagramBusinessAccountResponse> {
  const res: AxiosResponse<InstagramBusinessAccountResponse> = await axios.get(
    `${FB_BASE(`/${page_id}`)}`,
    {
      params: { fields: 'instagram_business_account', access_token: page_access_token },
    }
  );
  return res.data;
}

export async function createMediaContainer({
  igUserId,
  access_token,
  video_url,
  caption,
}: {
  igUserId: string;
  access_token: string;
  video_url: string;
  caption: string;
}): Promise<MediaContainerResponse> {
  const res: AxiosResponse<MediaContainerResponse> = await axios.post(
    `${FB_BASE(`/${igUserId}/media`)}`,
    null,
    {
      params: {
        media_type: 'REELS', // defaulting to REELS
        video_url,
        caption,
        access_token,
      },
    }
  );
  return res.data;
}

export async function publishMedia({
  igUserId,
  access_token,
  creation_id,
}: {
  igUserId: string;
  access_token: string;
  creation_id: string;
}): Promise<PublishMediaResponse> {
  const res: AxiosResponse<PublishMediaResponse> = await axios.post(
    `${FB_BASE(`/${igUserId}/media_publish`)}`,
    null,
    {
      params: { creation_id, access_token },
    }
  );
  return res.data;
}
