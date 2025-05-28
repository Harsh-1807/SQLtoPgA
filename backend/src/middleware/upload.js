const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only .sql files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/x-sql' || 
      file.originalname.toLowerCase().endsWith('.sql')) {
    cb(null, true);
  } else {
    cb(new Error('Only .sql files are allowed'), false);
  }
};

// Create the multer instance
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

module.exports = upload;