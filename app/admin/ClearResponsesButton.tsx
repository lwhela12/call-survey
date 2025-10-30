'use client';

import { useState } from 'react';
import { DefaultTheme } from 'styled-components';

type ClearResponsesButtonProps = {
  theme: DefaultTheme;
  responseCount: number;
  onClearComplete: () => void;
};

export function ClearResponsesButton({ theme, responseCount, onClearComplete }: ClearResponsesButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClear = async () => {
    setIsClearing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/clear-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to clear responses');
      }

      // Close modal and refresh
      setShowModal(false);
      onClearComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear responses');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      {/* Go Live Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={responseCount === 0}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: responseCount === 0 ? '#D1D5DB' : '#DC2626',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: theme.borderRadius?.md || '0.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: responseCount === 0 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: theme.fonts?.body || 'inherit',
          boxShadow: responseCount === 0 ? 'none' : '0 2px 4px rgba(220, 38, 38, 0.2)',
        }}
        onMouseEnter={(e) => {
          if (responseCount > 0) {
            e.currentTarget.style.backgroundColor = '#B91C1C';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (responseCount > 0) {
            e.currentTarget.style.backgroundColor = '#DC2626';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.2)';
          }
        }}
      >
        🚀 Go Live
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => !isClearing && setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: theme.colors?.surface || '#FFFFFF',
              borderRadius: theme.borderRadius?.lg || '1rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: theme.colors?.text?.primary || '#1F2937',
                  fontFamily: theme.fonts?.heading || 'inherit',
                  marginBottom: '0.5rem',
                }}
              >
                ⚠️ Clear All Test Data?
              </h2>
              <p
                style={{
                  color: theme.colors?.text?.secondary || '#4A5568',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                }}
              >
                This will permanently delete <strong>{responseCount}</strong> {responseCount === 1 ? 'response' : 'responses'} and all associated answers. This action cannot be undone.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: theme.borderRadius?.md || '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  color: '#991B1B',
                  fontSize: '0.875rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                disabled={isClearing}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: theme.colors?.surface || '#FFFFFF',
                  color: theme.colors?.text?.primary || '#1F2937',
                  border: `1px solid ${theme.colors?.border || '#E5E7EB'}`,
                  borderRadius: theme.borderRadius?.md || '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: isClearing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: theme.fonts?.body || 'inherit',
                  opacity: isClearing ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isClearing) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isClearing) {
                    e.currentTarget.style.backgroundColor = theme.colors?.surface || '#FFFFFF';
                  }
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleClear}
                disabled={isClearing}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isClearing ? '#9CA3AF' : '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: theme.borderRadius?.md || '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: isClearing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: theme.fonts?.body || 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => {
                  if (!isClearing) {
                    e.currentTarget.style.backgroundColor = '#B91C1C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isClearing) {
                    e.currentTarget.style.backgroundColor = '#DC2626';
                  }
                }}
              >
                {isClearing ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid #FFFFFF',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    Clearing...
                  </>
                ) : (
                  'Yes, Clear All Data'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner Animation */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
