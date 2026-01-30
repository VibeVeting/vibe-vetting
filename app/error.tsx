'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
        padding: '40px 20px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div
          style={{
            fontSize: '80px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '20px',
          }}
        >
          Oops!
        </div>
        <h1 style={{ color: '#fff', marginBottom: '16px', fontSize: '24px' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: '30px', lineHeight: 1.6 }}>
          We encountered an unexpected error. Please try again.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
