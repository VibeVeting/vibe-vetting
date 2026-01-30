import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 20px',
      }}
    >
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            filter: 'blur(120px)',
            opacity: 0.3,
            top: '-200px',
            right: '-100px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'linear-gradient(135deg, #00f5ff 0%, #667eea 100%)',
            borderRadius: '50%',
            filter: 'blur(120px)',
            opacity: 0.25,
            bottom: '-150px',
            left: '-100px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '600px' }}>
        {/* Error Code */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(100px, 25vw, 180px)',
              fontWeight: 800,
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.3) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            4
          </span>
          <span
            style={{
              fontSize: 'clamp(100px, 25vw, 180px)',
              fontWeight: 800,
              background: 'linear-gradient(180deg, #667eea 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            0
          </span>
          <span
            style={{
              fontSize: 'clamp(100px, 25vw, 180px)',
              fontWeight: 800,
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.3) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            4
          </span>
        </div>

        {/* Message */}
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            fontSize: '17px',
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: 1.6,
            marginBottom: '40px',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '60px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
            }}
          >
            <i className="fa-solid fa-home" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              transition: 'all 0.3s ease',
            }}
          >
            <i className="fa-solid fa-gauge" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Helpful Links */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '40px',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '24px',
            }}
          >
            Helpful Links
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { href: '/creators', icon: 'fa-users', label: 'Creators' },
              { href: '/campaigns', icon: 'fa-bullhorn', label: 'Campaigns' },
              { href: '/analytics', icon: 'fa-chart-line', label: 'Analytics' },
              { href: '/pricing', icon: 'fa-tag', label: 'Pricing' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <i className={`fa-solid ${link.icon}`} style={{ fontSize: '12px', color: '#667eea' }} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
