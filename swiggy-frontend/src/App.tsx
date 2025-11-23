import React from "react";
import { Routes, Route } from "react-router-dom";
import RestaurantListPage from "./pages/RestaurantListPage";
import RestaurantMenuPage from "./pages/RestaurantMenuPage";
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OrdersPage from "./pages/OrdersPage"; // we'll add soon
import { CartProvider } from "./context/CartContext";
import { LocationProvider } from "./context/LocationContext";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import "./App.css";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <LocationProvider>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<RestaurantListPage />} />
              <Route
                path="/restaurants/:id"
                element={<RestaurantMenuPage />}
              />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </main>
        </LocationProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
