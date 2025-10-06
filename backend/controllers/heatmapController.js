const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const generateGradcam = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = req.file.path; // uploaded image path
    const filename = path.basename(imagePath, path.extname(imagePath));
    const outputFolder = path.join(__dirname, "../heatmaps");

    if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

    const outputFilename = path.join(outputFolder, `${filename}_heatmap.jpg`);

    // Run Python Grad-CAM script
    const pythonProcess = spawn("python", [
      path.join(__dirname, "../gradcam.py"),
      imagePath,
      outputFilename
    ]);

    pythonProcess.stdout.on("data", (data) => {
      console.log("Python stdout:", data.toString());
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python stderr:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: "Python script failed" });
      }

      // Return proper URL for React Native
      const heatmapUrl = `http://${req.hostname}:3000/heatmaps/${filename}_heatmap.jpg`;
      res.json({ heatmap: heatmapUrl });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports= {generateGradcam}
