// src/models/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    favorites: { type: [String], default: [] }, // array de volumeId
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
