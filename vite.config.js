import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configure Vite to support React
export default defineConfig({
  plugins: [react()],
});
