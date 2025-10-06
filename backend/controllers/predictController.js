const { spawn } = require("child_process");
const path = require("path");

const handlePrediction = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const imagePath = path.join(__dirname, "..", req.file.path);

  // Spawn a fresh Python process
  const python = spawn("python", ["predict.py", imagePath]);

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error("Python error: ${data}");
  });

  python.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: "Python process failed", details: errorOutput });
    }
    try {
      const result = JSON.parse(output); // Expect JSON from Python
      res.json(result);
    } catch (e) {
      res.json({ raw: output.trim() }); // fallback if plain text
    }
  });
};

module.exports = { handlePrediction };
