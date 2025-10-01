import mongoose, { Schema, Document, Types } from "mongoose";

export type ProviderType = "facebook" | "youtube";

export interface IProvider extends Document {
  user: Types.ObjectId;
  provider: ProviderType;
  providerId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  scope?: string;
  pages?: any[];
  igUserId?: string;
  channelId?: string;
  createdAt: Date;
}

const providerSchema = new Schema<IProvider>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: String, enum: ["facebook", "youtube"], required: true },
  providerId: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  tokenExpiresAt: { type: Date },
  scope: { type: String },
  pages: { type: Array, default: [] },
  igUserId: { type: String },
  channelId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

providerSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export const Provider = mongoose.model<IProvider>("Provider", providerSchema);
