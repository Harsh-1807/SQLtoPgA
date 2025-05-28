const path = require('path');
const fs = require('fs');
const { executeSqlFile, previewSqlFile } = require('../utils/sqlExecutor');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Validate SQL schema
 */
const validateSchema = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No SQL file uploaded' 
      });
    }

    const filePath = req.file.path;
    const sqlContent = fs.readFileSync(filePath, 'utf8');

    // Analyze schema
    const validation = {
      warnings: [],
      duplicates: [],
      tables: new Set()
    };

    // Extract table definitions
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)/gi;
    let match;
    const tableNames = [];

    while ((match = createTableRegex.exec(sqlContent)) !== null) {
      const tableName = match[1].toLowerCase();
      tableNames.push(tableName);
      validation.tables.add(tableName);
    }

    // Check for duplicate table names
    const duplicateTables = tableNames.filter((table, index) => tableNames.indexOf(table) !== index);
    if (duplicateTables.length > 0) {
      validation.duplicates.push(
        `Found duplicate table names: ${duplicateTables.join(', ')}. They will be handled automatically.`
      );
    }

    // Check for potential issues
    if (sqlContent.includes('DROP TABLE')) {
      validation.warnings.push('SQL file contains DROP TABLE statements. This may cause data loss.');
    }

    if (sqlContent.includes('TRUNCATE')) {
      validation.warnings.push('SQL file contains TRUNCATE statements. This will clear existing data.');
    }

    // Check for unsupported data types
    const unsupportedTypes = ['BLOB', 'CLOB', 'LONG', 'LONGBLOB', 'LONGTEXT', 'MEDIUMBLOB', 'MEDIUMTEXT', 'TINYBLOB', 'TINYTEXT'];
    unsupportedTypes.forEach(type => {
      if (sqlContent.toUpperCase().includes(type)) {
        validation.warnings.push(`Found unsupported data type: ${type}. This may cause issues during migration.`);
      }
    });

    res.status(200).json({
      success: true,
      validation
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Server error: ${error.message}` 
    });
  }
};

/**
 * Handle SQL file upload and execution
 */
const uploadAndExecuteSql = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No SQL file uploaded' 
      });
    }

    const filePath = req.file.path;
    const result = await executeSqlFile(filePath);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Server error: ${error.message}` 
    });
  }
};

/**
 * Preview SQL file content before execution
 */
const previewSql = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No SQL file uploaded' 
      });
    }

    const filePath = req.file.path;
    const result = previewSqlFile(filePath);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Server error: ${error.message}` 
    });
  }
};

module.exports = {
  uploadAndExecuteSql,
  previewSql,
  validateSchema
};