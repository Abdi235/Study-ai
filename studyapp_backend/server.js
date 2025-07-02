const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient(); // Initialize Prisma Client
const PORT = process.env.PORT || 3001; // Backend port
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral'; // Default model, can be changed

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Basic Route
app.get('/', (req, res) => {
  res.send('Study App Backend is running!');
});

// --- File Upload Configuration ---
const UPLOAD_DIR = './uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Keep original extension, add timestamp for uniqueness
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type: Only PDF files are allowed.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// --- API Endpoints ---
// Endpoint for generating study material
app.post('/api/generate', upload.single('studyDocument'), async (req, res, next) => { // Added async and next
  // 'studyDocument' is the name attribute of the file input field in the frontend

  if (!req.file) {
    return res.status(400).json({ error: req.fileValidationError || 'No file uploaded or invalid file type.' });
  }

  const filePath = req.file.path;
  const { materialType } = req.body;

  if (!materialType) {
    fs.unlinkSync(filePath); // Clean up uploaded file
    return res.status(400).json({ error: 'Material type is required.' });
  }

  console.log('File received:', req.file.filename);
  console.log('Material type:', materialType);

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const extractedText = pdfData.text;

    console.log('Extracted text length:', extractedText.length);
    // For brevity, don't log the full text to console in production
    // console.log('Extracted text:', extractedText.substring(0, 200) + "...");

    // --- Ollama Integration ---
    console.log(`Sending text to Ollama (${OLLAMA_MODEL}) for ${materialType} generation...`);

    const prompt = `Based on the following text, generate ${materialType}:\n\n${extractedText}`;

    const ollamaResponse = await axios.post(OLLAMA_API_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false // We want the full response, not a stream
    });

    const generatedContent = ollamaResponse.data.response; // Adjust based on actual Ollama API response structure
    console.log('Ollama response received.');
    // console.log('Generated content snippet:', generatedContent.substring(0, 200) + "...");

    // --- Store in Database using Prisma ---
    const savedMaterial = await prisma.studyMaterial.create({
      data: {
        filename: req.file.filename, // Original filename from multer
        materialType: materialType,
        generatedContent: generatedContent,
        // createdAt is handled by @default(now()) in schema
      },
    });
    console.log('Saved to database, ID:', savedMaterial.id);

    res.json({
      result: generatedContent, // As per user prompt for success response
      id: savedMaterial.id // Optionally include ID of the generated entry
    });

    // File cleanup after successful processing by Ollama and Prisma
    fs.unlinkSync(filePath);
    console.log(`Cleaned up uploaded file: ${filePath}`);

  } catch (error) {
    console.error('Error during processing (PDF, Ollama, Prisma, etc.):', error.response ? error.response.data : error.message);
    // Ensure file is cleaned up on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    // Pass error to the main error handler for multer, or define a new one
    return res.status(500).json({ error: 'Could not process the file.' }); // Aligned with user prompt
  }

}, (error, req, res, next) => { // This is primarily Multer's error handler
  // Multer error handling
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.message });
  } else if (error) {
    // Custom error from fileFilter or other errors
    // If a file was uploaded before this error, multer might have saved it.
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // Clean up orphaned file
    }
    return res.status(400).json({ error: error.message });
  }
  next();
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
