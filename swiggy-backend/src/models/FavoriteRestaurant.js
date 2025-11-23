import mongoose from "mongoose";

const favoriteRestaurantSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    name: String,
    avgRating: Number,
  },
  { timestamps: true }
);

favoriteRestaurantSchema.index(
  { userId: 1, restaurantId: 1 },
  { unique: true }
);

export const FavoriteRestaurant = mongoose.model(
  "FavoriteRestaurant",
  favoriteRestaurantSchema
);
