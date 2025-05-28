import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import SqlPreview from './components/SqlPreview';
import ExecutionStatus from './components/ExecutionStatus';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [sqlPreview, setSqlPreview] = useState('');
  const [executionResult, setExecutionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [schemaValidation, setSchemaValidation] = useState(null);

  const handleFileSelect = (file) => {
    setCurrentFile(file);
    setSqlPreview('');
    setExecutionResult(null);
    setSchemaValidation(null);
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('sqlFile', file);

      // First, validate the schema
      const validationResponse = await axios.post(`${API_URL}/validate-schema`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (validationResponse.data.success) {
        setSchemaValidation(validationResponse.data.validation);
        
        // If schema is valid, proceed with preview
        const previewResponse = await axios.post(`${API_URL}/preview`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (previewResponse.data.success) {
          setSqlPreview(previewResponse.data.content);
        } else {
          setExecutionResult({
            success: false,
            message: previewResponse.data.message || 'Failed to preview SQL file',
            error: previewResponse.data.error
          });
        }
      } else {
        setExecutionResult({
          success: false,
          message: 'Schema validation failed',
          error: validationResponse.data.error
        });
      }
    } catch (error) {
      setExecutionResult({
        success: false,
        message: 'Error processing file',
        error: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSql = async () => {
    if (!currentFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('sqlFile', currentFile);

      const response = await axios.post(`${API_URL}/execute`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setExecutionResult(response.data);
      setSqlPreview('');
      setCurrentFile(null);
      setSchemaValidation(null);
    } catch (error) {
      setExecutionResult({
        success: false,
        message: 'Error executing SQL file',
        error: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSqlPreview('');
    setSchemaValidation(null);
  };

  return (
    <div className="App">
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <h1 className="text-center mb-4">SQL to Neo4j Migration Tool</h1>
                <p className="text-center">
                  Upload a SQL file to migrate your PostgreSQL database schema and data to Neo4j
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <FileUpload 
              onFileSelect={handleFileSelect} 
              onFileUpload={handleFileUpload} 
            />
            
            {loading && (
              <div className="text-center my-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Processing...</p>
              </div>
            )}

            {schemaValidation && (
              <div className="schema-validation mb-4">
                <Card>
                  <Card.Header as="h5">Schema Validation Results</Card.Header>
                  <Card.Body>
                    <ul className="list-unstyled mb-0">
                      {schemaValidation.warnings?.map((warning, index) => (
                        <li key={index} className="text-warning mb-2">
                          ⚠️ {warning}
                        </li>
                      ))}
                      {schemaValidation.duplicates?.map((dup, index) => (
                        <li key={index} className="text-info mb-2">
                          ℹ️ {dup}
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              </div>
            )}

            {sqlPreview && (
              <SqlPreview 
                sqlContent={sqlPreview} 
                onExecute={handleExecuteSql}
                onCancel={handleCancel}
              />
            )}

            {executionResult && (
              <ExecutionStatus executionResult={executionResult} />
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;