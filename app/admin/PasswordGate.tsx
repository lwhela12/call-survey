'use client';

import { useState, useEffect, FormEvent } from 'react';
import { DefaultTheme } from 'styled-components';

const AUTH_STORAGE_KEY = 'nesolagus_admin_auth';
const AUTH_EXPIRY_KEY = 'nesolagus_admin_expiry';

type PasswordGateProps = {
  children: React.ReactNode;
  theme: DefaultTheme;
};

export function PasswordGate({ children, theme }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem(AUTH_STORAGE_KEY);
      const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);

      if (!authToken || !expiry) {
        setIsChecking(false);
        return;
      }

      // Check if auth has expired
      if (new Date(expiry) < new Date()) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_EXPIRY_KEY);
        setIsChecking(false);
        return;
      }

      setIsAuthenticated(true);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Verify password via API
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Set auth token with 24-hour expiry
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);

        localStorage.setItem(AUTH_STORAGE_KEY, 'authenticated');
        localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toISOString());

        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  if (isChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors?.background || '#f6f6f4'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${theme.colors?.primary || '#307355'}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors?.background || '#f6f6f4',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: theme.colors?.surface || '#FFFFFF',
          padding: '2.5rem',
          borderRadius: theme.borderRadius?.lg || '1rem',
          boxShadow: theme.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: theme.colors?.text?.primary || '#1F2937',
            marginBottom: '0.5rem',
            fontFamily: theme.fonts?.heading || 'inherit'
          }}>
            Admin Dashboard
          </h1>
          <p style={{
            color: theme.colors?.text?.secondary || '#4A5568',
            marginBottom: '2rem',
            fontSize: '0.875rem'
          }}>
            Please enter the admin password to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: theme.colors?.text?.primary || '#1F2937',
                  marginBottom: '0.5rem'
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `1px solid ${theme.colors?.border || '#E2E8F0'}`,
                  borderRadius: theme.borderRadius?.md || '0.5rem',
                  fontSize: '1rem',
                  fontFamily: theme.fonts?.body || 'inherit',
                  transition: 'border-color 150ms',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors?.primary || '#307355';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors?.border || '#E2E8F0';
                }}
                required
                autoFocus
              />
            </div>

            {error && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                borderRadius: theme.borderRadius?.md || '0.5rem',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                backgroundColor: theme.colors?.primary || '#307355',
                color: theme.colors?.text?.inverse || '#FFFFFF',
                border: 'none',
                borderRadius: theme.borderRadius?.md || '0.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: theme.fonts?.body || 'inherit',
                transition: 'opacity 150ms'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
