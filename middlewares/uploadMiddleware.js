const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "task_manager_uploads", // Cloudinary folder name
    allowed_formats: ["jpeg", "jpg", "png"],
  },
});

// Multer upload middleware
const upload = multer({ storage });

module.exports = upload;
