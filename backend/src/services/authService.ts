// services/authService.ts
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";

export const issueTokensForUser = async (user: any, res: any) => {
  const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
  const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return {
    accessToken,
    user: {
      id: user._id,
      email: user.email,
    },
  };
};
