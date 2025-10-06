const express = require("express");
const path = require("path");

const predictRoutes = require("./routes/predict");
const heatmapRoutes = require("./routes/heatmap");

const app = express();
app.use(express.json());

// Serve generated heatmaps
app.use("/heatmaps", express.static(path.join(__dirname, "heatmaps")));

// Mount routes
app.use("/predict", predictRoutes);      
app.use("/heatmap", heatmapRoutes); 

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
