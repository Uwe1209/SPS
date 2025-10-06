const express = require("express");
const multer = require("multer");
const { handlePrediction } = require("../controllers/predictController");

const router = express.Router();

// Multer config: saves uploaded files into "uploads/"
const upload = multer({ dest: "uploads/" });

// POST /predict
router.post("/", upload.single("image"), handlePrediction);

module.exports = router;
