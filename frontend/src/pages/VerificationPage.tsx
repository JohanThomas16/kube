import React, { useState } from 'react';
import { JsonEditor } from '../components/JsonEditor';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { apiService } from '../services/api';
import { VerificationResponse, ErrorResponse } from '../types';

export const VerificationPage: React.FC = () => {
  const [jsonValue, setJsonValue] = useState('{\n  "name": "John Doe",\n  "role": "Developer",\n  "department": "Engineering",\n  "level": "Senior"\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
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
      const response = await apiService.verifyCredential(credential);
      setResult(response);
    } catch (err) {
      if (err instanceof Error && 'response' in err) {
        setError((err as any).response);
      } else {
        setError({
          error: 'Network Error',
          message: err instanceof Error ? err.message : 'Failed to verify credential'
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
          <h2 className="text-lg font-medium text-gray-900">Verify Credential</h2>
          <p className="mt-1 text-sm text-gray-500">
            Submit a JSON credential to verify if it has been previously issued. The service will check if the credential exists and return its issuance details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <JsonEditor
              value={jsonValue}
              onChange={setJsonValue}
              placeholder="Enter the credential JSON to verify..."
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                {loading ? 'Verifying...' : 'Verify Credential'}
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
                type={result.valid ? 'success' : 'warning'}
                title={result.valid ? 'Credential Valid' : 'Credential Not Found'}
                message={
                  <div className="space-y-2">
                    <p>{result.message || (result.valid ? 'This credential has been verified as authentic.' : 'This credential was not found in the system.')}</p>
                    {result.valid && result.workerId && result.issuedAt && (
                      <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                        <div><strong>Originally Issued By:</strong> {result.workerId}</div>
                        <div><strong>Issued At:</strong> {new Date(result.issuedAt).toLocaleString()}</div>
                        <div><strong>Status:</strong> Valid ✓</div>
                      </div>
                    )}
                    {!result.valid && (
                      <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                        <div><strong>Status:</strong> Not Found ✗</div>
                      </div>
                    )}
                  </div>
                }
                onClose={() => setResult(null)}
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-800 mb-2">How it works:</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Enter the same JSON credential that was previously issued</li>
          <li>• The service will normalize the JSON (sort keys) for consistent lookup</li>
          <li>• If the credential exists, you'll get verification details including original issuer</li>
          <li>• If the credential doesn't exist, you'll get a "not found" response</li>
          <li>• Property order doesn't matter - {"{"}"name": "John", "role": "Dev"{"}"} equals {"{"}"role": "Dev", "name": "John"{"}"}</li>
        </ul>
      </div>
    </div>
  );
};
