import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import SwiggyLogo from "../assets/swiggy-logo.svg";
import LocationModal from "./LocationModal";
import { useLocationContext } from "../context/LocationContext";

const Header: React.FC = () => {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const { location, setLocationName, setLocationByCoords } =
    useLocationContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);

  const handleSaveLocation = (newLocation: string) => {
    setLocationName(newLocation);
    setIsLocationModalOpen(false);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationByCoords(latitude, longitude);
        setIsGeoLoading(false);
        setIsLocationModalOpen(false);
      },
      () => {
        alert("Unable to fetch your location. Please allow location access.");
        setIsGeoLoading(false);
      }
    );
  };

  const handleAuthClick = () => {
    if (user) {
      logout();
    } else {
      navigate("/login");
    }
  };

  const firstLetter = user
    ? user.name.charAt(0).toUpperCase()
    : location.name.charAt(0).toUpperCase() || "G";

  return (
    <>
      <header className="app-header header-elevated">
        <div className="header-container">
          {/* LEFT: Logo + location */}
          <div className="header-left">
            <Link to="/" className="logo">
              <div className="logo-mark">
                <img src={SwiggyLogo} alt="Swiggy Logo" className="logo-img" />
              </div>
              <div className="logo-text-wrap">
                <span className="logo-brand">Swiggy</span>
              </div>
            </Link>
            <button
              type="button"
              className="header-location"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <span className="location-pin">📍</span>
              <div className="location-text">
                <span className="location-label">Deliver to</span>
                <span className="location-value">
                  {location.name || "Select location"}
                </span>
              </div>
              <span className="location-change">
                {isGeoLoading ? "Detecting..." : "Change"}
              </span>
            </button>
          </div>

          {/* CENTER: Navigation */}
          <nav className="header-nav">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              <span className="nav-icon">🏠</span>
              <span>Restaurants</span>
            </NavLink>

            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              <span className="nav-icon">❤️</span>
              <span>Favourites</span>
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              <span className="nav-icon">📦</span>
              <span>Orders</span>
            </NavLink>
          </nav>

          {/* RIGHT: Cart + profile/login */}
          <div className="header-right">
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                isActive
                  ? "cart-link header-cart nav-link-active"
                  : "cart-link header-cart"
              }
            >
              <span className="cart-icon">🛒</span>
              <span className="cart-label">Cart</span>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </NavLink>

            <button
              className="profile-btn header-profile"
              type="button"
              onClick={handleAuthClick}
            >
              <span className="profile-avatar">{firstLetter}</span>
              <div className="profile-text">
                <span className="profile-name">
                  {user ? user.name : "Guest"}
                </span>
                <span className="profile-action">
                  {user ? "Logout" : "Login"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      <LocationModal
        isOpen={isLocationModalOpen}
        initialValue={location.name}
        onSave={handleSaveLocation}
        onClose={() => setIsLocationModalOpen(false)}
        onUseMyLocation={handleUseMyLocation}
      />
    </>
  );
};

export default Header;
