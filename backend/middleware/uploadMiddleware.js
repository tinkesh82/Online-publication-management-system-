import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsBaseDir = path.join(__dirname, "..", "uploads"); // Go up one level from middleware to project root
const publicationsDir = path.join(uploadsBaseDir, "publications");

// Ensure the uploads directory exists
if (!fs.existsSync(publicationsDir)) {
  fs.mkdirSync(publicationsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, publicationsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter to accept only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20MB limit for PDF files
  },
});

export const uploadPdf = upload.single("publicationPdf"); // 'publicationPdf' is the field name in form-data

// Middleware to handle multer errors specifically
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ success: false, message: "File too large. Max 20MB allowed." });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    // An unknown error occurred when uploading.
    if (err.message === "Only PDF files are allowed!") {
      // Custom error from fileFilter
      return res.status(400).json({ success: false, message: err.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "File upload error: " + err.message });
  }
  // Everything went fine.
  next();
};
