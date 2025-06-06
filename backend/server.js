import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // To handle __dirname in ES modules

import config from "./config/index.js";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import publicationRoutes from "./routes/publicationRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// --- ES Module equivalents for __filename and __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- ---

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data

// Serve static files from the 'uploads' directory
// This makes files in 'uploads/publications' accessible via e.g. '/uploads/publications/filename.pdf'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount Routers
app.use("/api/auth", authRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/users", userRoutes); // <--- CRITICAL LINE
// Simple test route
app.get("/", (req, res) => {
  res.send("Publication Management API Running");
});

// Error Handler Middleware (should be last piece of middleware)
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
