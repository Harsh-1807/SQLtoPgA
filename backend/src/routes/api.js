const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const sqlController = require('../controllers/sqlController');

// Route for schema validation
router.post('/validate-schema', upload.single('sqlFile'), sqlController.validateSchema);

// Route for SQL file preview
router.post('/preview', upload.single('sqlFile'), sqlController.previewSql);

// Route for SQL file execution
router.post('/execute', upload.single('sqlFile'), sqlController.uploadAndExecuteSql);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

module.exports = router;