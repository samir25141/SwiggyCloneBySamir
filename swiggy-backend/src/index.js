// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import {
  fetchRestaurantsFromSwiggy,
  fetchMenuFromSwiggy,
} from "./swiggyService.js";
import { FavoriteRestaurant } from "./models/FavoriteRestaurant.js";
import { Cart } from "./models/Cart.js";
import { Order } from "./models/Order.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./models/User.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

// ---------------------- APP & DB SETUP ----------------------

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

/**
 * AUTH ROUTES
 */

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Failed to register" });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Failed to login" });
  }
});

/**
 * CART ROUTES
 */

// GET /api/cart
app.get("/api/cart", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.json({ items: [] });
    res.json({ items: cart.items });
  } catch (err) {
    console.error("Error loading cart:", err);
    res.status(500).json({ message: "Failed to load cart" });
  }
});

// PUT /api/cart  (save full cart)
app.put("/api/cart", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { userId: req.userId },
      { userId: req.userId, items: items || [] },
      { upsert: true, new: true }
    );

    res.json({ items: cart.items });
  } catch (err) {
    console.error("Error saving cart:", err);
    res.status(500).json({ message: "Failed to save cart" });
  }
});

/**
 * RESTAURANT ROUTES
 */

// GET /api/restaurants?search=&minRating=&cuisine=&lat=&lng=
app.get("/api/restaurants", async (req, res) => {
  try {
    const {
      search = "",
      minRating = 0,
      cuisine = "",
      lat,
      lng,
    } = req.query;

    const latNum = lat !== undefined ? parseFloat(lat) : NaN;
    const lngNum = lng !== undefined ? parseFloat(lng) : NaN;

    let restaurants = await fetchRestaurantsFromSwiggy(
      isNaN(latNum) ? undefined : latNum,
      isNaN(lngNum) ? undefined : lngNum
    );

    const searchLower = search.toString().toLowerCase();
    const minRatingNum = Number(minRating) || 0;

    restaurants = restaurants.filter((r) => {
      const matchesSearch =
        !searchLower ||
        r.name.toLowerCase().includes(searchLower) ||
        r.cuisines.some((c) => c.toLowerCase().includes(searchLower));

      const matchesRating = r.avgRating >= minRatingNum;

      const matchesCuisine =
        !cuisine ||
        r.cuisines.some(
          (c) => c.toLowerCase() === cuisine.toString().toLowerCase()
        );

      return matchesSearch && matchesRating && matchesCuisine;
    });

    res.json({ data: restaurants });
  } catch (err) {
    console.error("Restaurants error:", err);
    res.status(500).json({ message: "Failed to fetch restaurants" });
  }
});

// GET /api/restaurants/:id/menu?lat=&lng=
app.get("/api/restaurants/:id/menu", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const latNum = lat !== undefined ? parseFloat(lat) : NaN;
    const lngNum = lng !== undefined ? parseFloat(lng) : NaN;

    const menu = await fetchMenuFromSwiggy(
      req.params.id,
      isNaN(latNum) ? undefined : latNum,
      isNaN(lngNum) ? undefined : lngNum
    );

    res.json({ data: menu });
  } catch (err) {
    console.error("Menu error:", err);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
});

/**
 * FAVORITES ROUTES (per user)
 */

app.post("/api/favorites", authMiddleware, async (req, res) => {
  try {
    const { restaurantId, name, avgRating } = req.body;

    const fav = await FavoriteRestaurant.findOneAndUpdate(
      { userId: req.userId, restaurantId },
      { userId: req.userId, restaurantId, name, avgRating },
      { upsert: true, new: true }
    );

    res.json(fav);
  } catch (err) {
    console.error("Favorite save error:", err);
    res.status(500).json({ message: "Failed to save favorite" });
  }
});

app.get("/api/favorites", authMiddleware, async (req, res) => {
  try {
    const favorites = await FavoriteRestaurant.find({ userId: req.userId });
    res.json(favorites);
  } catch (err) {
    console.error("Favorite load error:", err);
    res.status(500).json({ message: "Failed to load favourites" });
  }
});

app.delete(
  "/api/favorites/:restaurantId",
  authMiddleware,
  async (req, res) => {
    try {
      await FavoriteRestaurant.findOneAndDelete({
        userId: req.userId,
        restaurantId: req.params.restaurantId,
      });
      res.json({ success: true });
    } catch (err) {
      console.error("Favorite delete error:", err);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  }
);

/**
 * ORDERS
 */

// POST /api/orders  { items: [...], total: number }
app.post("/api/orders", authMiddleware, async (req, res) => {
  try {
    const { items, total } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items to order" });
    }

    const order = await Order.create({
      userId: req.userId,
      items,
      total,
    });

    // Clear cart after placing order
    await Cart.findOneAndUpdate(
      { userId: req.userId },
      { items: [] },
      { upsert: true }
    );

    res.json(order);
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
});

// GET /api/orders
app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error("Orders load error:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

// ---------------------- START SERVER ----------------------

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
