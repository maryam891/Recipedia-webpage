import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8080",
      "/user": "http://localhost:8080",
      "/Login": "http://localhost:8080",
      "/signup": "http://localhost:8080",
      "/logout": "http://localhost:8080",
      "/Profile": "http://localhost:8080",
      "/getFavoriteRecipes": "http://localhost:8080",
      "/addFavoriteRecipe": "http://localhost:8080",
      "/removeFavoriteRecipe": "http://localhost:8080",
      "/recipes": "http://localhost:8080",
    },
  },
});
