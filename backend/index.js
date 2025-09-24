const express = require("express");
const path = require("path");

const predictRoutes = require("./routes/predict");

const app = express();

// Middleware for JSON parsing (optional, useful for APIs)
app.use(express.json());

// Mount routes
app.use("/predict", predictRoutes);

// Start server
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
