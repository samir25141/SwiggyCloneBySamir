# Swiggy Clone – Full Stack Assignment

A Swiggy-style food ordering web app with:

- Live restaurant list & menu from **Swiggy public APIs** (via backend proxy)
- Search & filters (rating, cuisine)
- Favourites (per user) stored in **MongoDB**
- Cart with quantity, taxes, delivery fee & order placement
- JWT-based **Login / Signup**
- Per-user **Cart, Favourites & Orders**
- Location selector with basic geolocation
- Fully responsive UI (mobile, tablet, desktop)

---

# Backend – Setup & Run (Node + Express + MongoDB)

- cd swiggy-backend
- npm install
- npm run dev

  **Backend dependencies used:**
- express
- mongoose
- axios
- cors
- dotenv
- bcryptjs
- jsonwebtoken
- nodemon

# Frontend – Setup & Run (Vite + React + TS)
- cd swiggy-frontend
- npm install
- npm run dev

  **Frontend dependencies used:**
- react
- react-dom
- react-router-dom
- axios
- typescript
- @types/react
- @types/react-dom
- Vite + React plugins (created via npm create   vite@latest with React + TS template)


## 1. Tech Stack

### Frontend

- **React** (with **TypeScript**)
- **Vite** (build tool)
- **React Router DOM** – routing
- **Axios** – API calls
- **Context API** – `AuthContext`, `CartContext`, `LocationContext`
- Plain **CSS** (App.css) for styling + responsive layout

### Backend

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **Axios** – for calling Swiggy APIs
- **dotenv** – environment variables
- **cors** – CORS handling
- **bcryptjs** – password hashing
- **jsonwebtoken (JWT)** – authentication
- **nodemon** – dev-time auto restart

### Data Layer

- Collections in MongoDB:
  - `users`
  - `carts`
  - `orders`
  - `favoriterestaurants`

---

## 2. Project Structure

```text
swiggy-clone/
├─ swiggy-backend/
│  ├─ src/
│  │  ├─ index.js              # Main Express app
│  │  ├─ swiggyService.js      # Swiggy API integration (restaurants + menu)
│  │  ├─ middleware/
│  │  │  └─ auth.js            # JWT auth middleware
│  │  ├─ models/
│  │  │  ├─ User.js
│  │  │  ├─ Cart.js
│  │  │  ├─ Order.js
│  │  │  └─ FavoriteRestaurant.js
│  │  └─ ...
│  ├─ package.json
│  └─ .env
│
├─ swiggy-frontend/
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ main.tsx
│  │  ├─ App.css
│  │  ├─ api/
│  │  │  ├─ client.ts          # Axios instance with baseURL + JWT header
│  │  │  ├─ restaurants.ts     # /api/restaurants
│  │  │  ├─ menu.ts            # /api/restaurants/:id/menu
│  │  │  ├─ favorites.ts       # /api/favorites
│  │  │  ├─ cart.ts            # /api/cart
│  │  │  └─ auth.ts            # /api/auth/login, /register
│  │  ├─ context/
│  │  │  ├─ AuthContext.tsx
│  │  │  ├─ CartContext.tsx
│  │  │  └─ LocationContext.tsx
│  │  ├─ pages/
│  │  │  ├─ RestaurantListPage.tsx
│  │  │  ├─ RestaurantMenuPage.tsx
│  │  │  ├─ CartPage.tsx
│  │  │  ├─ FavoritesPage.tsx
│  │  │  ├─ OrdersPage.tsx
│  │  │  ├─ LoginPage.tsx
│  │  │  └─ SignupPage.tsx
│  │  ├─ components/
│  │  │  ├─ Header.tsx
│  │  │  ├─ RestaurantCard.tsx
│  │  │  ├─ SearchBar.tsx
│  │  │  ├─ FilterBar.tsx
│  │  │  └─ LocationModal.tsx
│  │  ├─ types/
│  │  │  ├─ restaurant.ts
│  │  │  └─ menu.ts (if separate)
│  │  └─ assets/
│  │     └─ swiggy-logo.svg
│  ├─ index.html
│  ├─ package.json
│  └─ .env
└─ README.md


