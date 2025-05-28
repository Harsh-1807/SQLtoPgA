import React from 'react';
import { Alert, Card, Table, Badge } from 'react-bootstrap';

const ExecutionStatus = ({ executionResult }) => {
  if (!executionResult) return null;

  const { success, message, results, error } = executionResult;

  return (
    <div className="execution-status mb-4">
      <Card>
        <Card.Header as="h5">
          Execution Results
          <Badge 
            bg={success ? 'success' : 'danger'} 
            className="ms-2"
          >
            {success ? 'Success' : 'Failed'}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Alert variant={success ? 'success' : 'danger'}>
            {message}
          </Alert>
          
          {error && (
            <div className="error-details mb-3">
              <h6>Error Details:</h6>
              <pre className="bg-light p-2 border rounded">
                {error}
              </pre>
            </div>
          )}

          {success && results && results.length > 0 && (
            <div className="results-table">
              <h6>Executed Commands:</h6>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Command</th>
                    <th>Rows Affected</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <pre className="mb-0" style={{ maxWidth: '500px', overflow: 'auto' }}>
                          {result.command.length > 150 
                            ? `${result.command.substring(0, 150)}...` 
                            : result.command}
                        </pre>
                      </td>
                      <td>{result.rowCount}</td>
                      <td>
                        <Badge bg={result.success ? 'success' : 'danger'}>
                          {result.success ? 'Success' : 'Failed'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ExecutionStatus;