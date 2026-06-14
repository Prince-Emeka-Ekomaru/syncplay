"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080c14',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div>
          <h2 style={{ color: '#e63946', fontSize: '2rem', marginBottom: '1rem' }}>
            Critical Error
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
            {error?.message || 'A critical error occurred.'}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 2rem',
              background: '#e63946',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
