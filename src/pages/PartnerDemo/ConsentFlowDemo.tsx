import React, { useState } from 'react';
import { consentApi } from '../../services/api/consentApi';
import { analytics } from '../../utils/analytics';

const ConsentFlowDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    appId: '31dd630f-9577-4316-8e37-1b47219fe1eb',
    apiKey: 'cms_3292736c3c59f1578cd7408eb2ad408a201bf7ea5c78291470c6b2651b400d06',
    email: 'test_user@example.com',
    phone_number: '+1234567890',
    dob: '1990-01-01',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<'idle' | 'initiating' | 'waiting' | 'completed'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFlowState('initiating');

    try {
      analytics.logEvent('consent_initiated', { appId: formData.appId });

      const callbackUrl = `${window.location.origin}/consent/callback`;
      
      const res = await consentApi.initiateConsent(formData.appId, {
        email: formData.email || undefined,
        phone_number: formData.phone_number || undefined,
        dob: formData.dob || undefined,
        purposes: ['marketing', 'analytics'], // Demo purposes
        callback_url: callbackUrl,
      }, formData.apiKey);

      if (res.flow === 'guardian_required') {
        analytics.logEvent('minor_guardian_required');
      }

      const redirectUrl = res.redirect_url || res.pop_url;
      
      if (!redirectUrl) {
        throw new Error('No redirect URL provided by the server.');
      }

      // Open the hosted page
      // Here we choose to redirect the current window to demonstrate a full redirect flow.
      // The callback route will handle the return.
      window.location.href = redirectUrl;
      
      setFlowState('waiting');
    } catch (err: any) {
      console.error(err);
      
      // Handle known API errors based on contract
      if (err.message?.includes('404')) {
        setError('Session token invalid or not found. Please restart.');
      } else if (err.message?.includes('410')) {
        setError('Session expired. Please restart the consent process.');
      } else if (err.message?.includes('429')) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to initiate consent. Please check your inputs.');
      }
      setFlowState('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Partner Demo: Consent Gateway
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Test the redirect-based consent flow for both adults and minors.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleInitiate}>
            <div>
              <label htmlFor="appId" className="block text-sm font-medium text-gray-700">
                App ID (Partner ID)
              </label>
              <div className="mt-1">
                <input
                  id="appId"
                  name="appId"
                  type="text"
                  required
                  value={formData.appId}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <div className="mt-1">
                <input
                  id="apiKey"
                  name="apiKey"
                  type="text"
                  required
                  value={formData.apiKey}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Provide either Email or Phone Number.</p>
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="mt-1">
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Determines if standard or guardian flow is triggered.</p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || flowState === 'waiting'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Initiating...' : flowState === 'waiting' ? 'Waiting for Consent...' : 'Initiate Consent Flow'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsentFlowDemo;
