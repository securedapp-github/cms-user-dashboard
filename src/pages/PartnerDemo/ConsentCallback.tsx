import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { analytics } from '../../utils/analytics';

const ConsentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('Processing your consent...');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    // The hosted page redirects here with parameters, e.g. ?status=success&consent_id=... or ?status=error
    const flowStatus = searchParams.get('status');
    const errorCode = searchParams.get('error');

    if (flowStatus === 'success') {
      analytics.logEvent('consent_completed');
      setStatus('Consent successfully recorded!');
      setIsSuccess(true);
    } else if (flowStatus === 'error' || errorCode) {
      setStatus(`Consent failed or was cancelled. ${errorCode ? `Error: ${errorCode}` : ''}`);
      setIsSuccess(false);
    } else {
      // Fallback if accessed directly or without params
      setStatus('No consent data found in URL. Please start the flow again.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Consent Status
          </h2>
          <div className="mt-4">
            {isSuccess ? (
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <p className={`mt-2 text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'} font-medium`}>
            {status}
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => navigate('/demo/consent')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Return to Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentCallback;
