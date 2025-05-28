import React, { useState, useRef } from 'react';
import { Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

const FileUpload = ({ onFileSelect, onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [schemaInfo, setSchemaInfo] = useState(null);
  const fileInputRef = useRef(null);
  const [success, setSuccess] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setSelectedFile(null);
      setError('');
      setSchemaInfo(null);
      setSuccess(null);
      return;
    }
    
    // Check if the file is an SQL file
    if (!file.name.toLowerCase().endsWith('.sql')) {
      setSelectedFile(null);
      setError('Please select a valid SQL file (.sql)');
      setSchemaInfo(null);
      setSuccess(null);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setSelectedFile(file);
    setError('');
    setSuccess(null);
    
    // Read file content to analyze schema
    try {
      const content = await file.text();
      const schemaAnalysis = analyzeSchema(content);
      setSchemaInfo(schemaAnalysis);
    } catch (err) {
      setError('Error analyzing SQL file schema');
      console.error('Schema analysis error:', err);
    }
    
    // Call the parent component's handler
    onFileSelect(file);
  };

  const analyzeSchema = (content) => {
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)/gi;
    const tables = [];
    let match;
    
    while ((match = createTableRegex.exec(content)) !== null) {
      tables.push(match[1].toLowerCase());
    }
    
    return {
      tableCount: tables.length,
      tables: tables,
      hasDuplicates: new Set(tables).size !== tables.length
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an SQL file first');
      return;
    }
    
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);
    
    try {
      // Call the parent component's upload handler
      await onFileUpload(selectedFile);
      setUploadProgress(100);
      setSuccess('File uploaded successfully!');
    } catch (err) {
      setError('Error uploading file: ' + err.message);
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleRunBackend = async () => {
    setIsRunning(true);
    setOutput('Starting migration...\n');
    
    try {
      const response = await axios.post('http://localhost:5001/run-migration');
      setSuccess('Migration completed successfully!');
      setOutput(prev => prev + '\n' + response.data.output);
    } catch (err) {
      setError(`Error running migration: ${err.message}`);
      setOutput(prev => prev + `\nError: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="file-upload mb-4">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Select SQL File</Form.Label>
          <Form.Control 
            type="file" 
            onChange={handleFileChange}
            accept=".sql"
            ref={fileInputRef}
          />
          <Form.Text className="text-muted">
            Only .sql files are accepted
          </Form.Text>
        </Form.Group>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {schemaInfo && (
          <Alert variant="info" className="mt-3">
            <h6>Schema Analysis:</h6>
            <ul className="mb-0">
              <li>Tables found: {schemaInfo.tableCount}</li>
              {schemaInfo.hasDuplicates && (
                <li className="text-warning">
                  ⚠️ Duplicate table names detected. They will be handled automatically.
                </li>
              )}
              {schemaInfo.tables.length > 0 && (
                <li>
                  Tables: {schemaInfo.tables.join(', ')}
                </li>
              )}
            </ul>
          </Alert>
        )}
        
        {uploadProgress > 0 && (
          <ProgressBar 
            now={uploadProgress} 
            label={`${uploadProgress}%`} 
            className="mt-3"
          />
        )}
        
        <div className="d-grid gap-2">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={!selectedFile}
          >
            Upload SQL File
          </Button>
        </div>
      </Form>
      
      {selectedFile && (
        <Alert variant="info" className="mt-3">
          File selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
        </Alert>
      )}

      <div className="d-flex gap-2 mt-3">
        <Button
          variant="success"
          onClick={handleRunBackend}
          disabled={isRunning}
        >
          {isRunning ? 'Running Migration...' : 'Run Migration Script'}
        </Button>
      </div>

      {output && (
        <Alert variant="info" className="mt-3">
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {output}
          </pre>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mt-3">
          {success}
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;