const fs = require('fs');
const { spawn } = require('child_process');
const pool = require('../config/db');

/**
 * Convert SQL schema using Python script
 * @param {string} sqlContent - SQL content to convert
 * @returns {Promise<string>} - Converted SQL content
 */
function convertSchema(sqlContent) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['src/utils/schemaConverter.py']);
    let convertedContent = '';
    let errorOutput = '';

    pythonProcess.stdin.write(sqlContent);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      convertedContent += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Schema conversion failed: ${errorOutput}`));
      } else {
        resolve(convertedContent);
      }
    });
  });
}

/**
 * Executes SQL commands from a file
 * @param {string} filePath - Path to the SQL file
 * @returns {Promise<Object>} - Execution results
 */
async function executeSqlFile(filePath) {
  try {
    // Read the SQL file
    let sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Convert MySQL syntax to PostgreSQL syntax
    sqlContent = await convertSchema(sqlContent);
    
    // Split the SQL content into separate commands
    // This is a simple implementation and might need improvements for complex SQL files
    const sqlCommands = sqlContent
      .replace(/\r\n/g, '\n')
      .split(';')
      .filter(cmd => cmd.trim() !== '');
    
    const results = [];
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Execute each SQL command sequentially
      for (let i = 0; i < sqlCommands.length; i++) {
        const command = sqlCommands[i];
        try {
          const result = await client.query(command);
          results.push({
            command: command.trim(),
            rowCount: result.rowCount,
            success: true
          });
        } catch (error) {
          results.push({
            command: command.trim(),
            error: error.message,
            success: false
          });
          // Continue with next command instead of failing completely
          continue;
        }
      }
      
      // Commit transaction
      await client.query('COMMIT');
      
      return {
        success: true,
        results,
        message: `Successfully executed ${results.filter(r => r.success).length} SQL commands`
      };
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      return {
        success: false,
        error: error.message,
        command: error.command || '',
        message: `Error executing SQL commands: ${error.message}`
      };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Error reading or processing the SQL file: ${error.message}`
    };
  } finally {
    // Clean up the uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }
}

/**
 * Preview SQL file content
 * @param {string} filePath - Path to the SQL file
 * @returns {Promise<Object>} - SQL file content preview
 */
async function previewSqlFile(filePath) {
  try {
    // Read the SQL file
    let sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Convert MySQL syntax to PostgreSQL syntax
    sqlContent = await convertSchema(sqlContent);
    
    return {
      success: true,
      content: sqlContent,
      message: 'SQL file preview generated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Error previewing the SQL file: ${error.message}`
    };
  }
}

module.exports = {
  executeSqlFile,
  previewSqlFile
}; 