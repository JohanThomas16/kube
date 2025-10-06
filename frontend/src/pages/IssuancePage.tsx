import React, { useState } from 'react';
import { JsonEditor } from '../components/JsonEditor';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { apiService } from '../services/api';
import { IssuanceResponse, ErrorResponse } from '../types';

export const IssuancePage: React.FC = () => {
  const [jsonValue, setJsonValue] = useState('{\n  "name": "John Doe",\n  "role": "Developer",\n  "department": "Engineering",\n  "level": "Senior"\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IssuanceResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jsonValue.trim()) {
      setError({ error: 'Validation Error', message: 'Please enter a credential JSON' });
      return;
    }

    let credential: Record<string, unknown>;
    try {
      credential = JSON.parse(jsonValue);
    } catch {
      setError({ error: 'JSON Error', message: 'Invalid JSON format' });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiService.issueCredential(credential);
      setResult(response);
    } catch (err) {
      if (err instanceof Error && 'response' in err) {
        setError((err as any).response);
      } else {
        setError({
          error: 'Network Error',
          message: err instanceof Error ? err.message : 'Failed to issue credential'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Issue Credential</h2>
          <p className="mt-1 text-sm text-gray-500">
            Submit a JSON credential to be issued by the issuance service. The service will store the credential and return a confirmation with the worker ID that processed it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <JsonEditor
              value={jsonValue}
              onChange={setJsonValue}
              placeholder="Enter your credential JSON here..."
              disabled={loading}
            />

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={clearResults}
                disabled={loading || (!result && !error)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Results
              </button>

              <button
                type="submit"
                disabled={loading || !jsonValue.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                {loading ? 'Issuing...' : 'Issue Credential'}
              </button>
            </div>
          </div>
        </form>

        {(result || error) && (
          <div className="px-6 pb-6">
            {error && (
              <Alert
                type="error"
                title={error.error}
                message={error.message}
                onClose={() => setError(null)}
              />
            )}

            {result && (
              <Alert
                type={result.status === 'issued' ? 'success' : 'info'}
                title={result.status === 'issued' ? 'Credential Issued Successfully' : 'Credential Already Exists'}
                message={
                  <div className="space-y-2">
                    <p>{result.message}</p>
                    <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                      <div><strong>Worker ID:</strong> {result.workerId}</div>
                      <div><strong>Issued At:</strong> {new Date(result.issuedAt).toLocaleString()}</div>
                      <div><strong>Status:</strong> {result.status}</div>
                    </div>
                  </div>
                }
                onClose={() => setResult(null)}
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Enter any valid JSON object as your credential</li>
          <li>• The service will normalize the JSON (sort keys) for consistent storage</li>
          <li>• If the credential is new, it will be issued with a 201 status</li>
          <li>• If the credential already exists, you'll get the original issuance details</li>
          <li>• Each response includes the worker ID that processed your request</li>
        </ul>
      </div>
    </div>
  );
};
