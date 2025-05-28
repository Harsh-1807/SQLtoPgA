import React from 'react';
import { Card, Button } from 'react-bootstrap';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const SqlPreview = ({ sqlContent, onExecute, onCancel }) => {
  if (!sqlContent) return null;

  return (
    <div className="sql-preview mb-4">
      <Card>
        <Card.Header as="h5">SQL Preview</Card.Header>
        <Card.Body>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            <SyntaxHighlighter language="sql" style={docco}>
              {sqlContent}
            </SyntaxHighlighter>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" className="me-2" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="success" onClick={onExecute}>
              Execute SQL
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SqlPreview;