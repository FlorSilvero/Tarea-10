import { Schema, model, models } from "mongoose";

const FavoriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    volumeId: { type: String, required: true, index: true }, // ID de Google Books
    book: {
      title: String,
      authors: [String],
      thumbnail: String,
    },
  },
  { timestamps: true }
);

// 🔑 Evita que un usuario guarde el mismo libro dos veces
FavoriteSchema.index({ userId: 1, volumeId: 1 }, { unique: true });

export default models.Favorite || model("Favorite", FavoriteSchema);
