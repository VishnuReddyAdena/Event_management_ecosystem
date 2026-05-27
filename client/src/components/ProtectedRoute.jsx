import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldAlert, LogOut, ArrowRight } from 'lucide-react';

const rolePaths = {
  organizer: '/login/organizer',
  volunteer: '/login/volunteer',
  participant: '/login/participant',
  sponsor: '/login/sponsor',
};

const roleNames = {
  organizer: 'Organizer',
  volunteer: 'Volunteer',
  participant: 'Student Participant',
  sponsor: 'Corporate Sponsor',
};

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading, logout } = useApp();
  const location = useLocation();

  // Show spinner while auth state resolves
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08080A',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="bg-ambient" />
        <div className="bg-grid" />
        <div style={{
          width: '36px', height: '36px',
          border: '2px solid rgba(255,255,255,0.08)',
          borderTop: '2px solid #ffffff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          zIndex: 1
        }} />
        <span style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.78rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          zIndex: 1
        }}>
          Authenticating...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in → send to the correct role's login page
  if (!user) {
    const loginPath = rolePaths[allowedRole] || '/';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Logged in but wrong role → block and show High-Contrast Access Denied modal
  if (allowedRole && user.role !== allowedRole) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08080A',
        padding: '20px',
        position: 'relative'
      }}>
        <div className="bg-ambient" />
        <div className="bg-grid" />
        
        {/* Access Denied Glassmorphic Modal */}
        <div style={{
          maxWidth: '480px',
          width: '100%',
          padding: '40px',
          borderRadius: '24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          zIndex: 10
        }}>
          <div style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            display: 'inline-flex',
            color: '#ffffff'
          }}>
            <ShieldAlert size={48} strokeWidth={1.5} />
          </div>
          
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '10px',
              letterSpacing: '-0.02em'
            }}>
              Access Denied
            </h2>
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: '1.6'
            }}>
              Your account with role <strong style={{ color: '#ffffff' }}>{roleNames[user.role] || user.role}</strong> does not have authorization to view the <strong style={{ color: '#ffffff' }}>{roleNames[allowedRole] || allowedRole}</strong> workspace.
            </p>
          </div>

          <div style={{
            width: '100%',
            height: '1px',
            background: 'rgba(255,255,255,0.06)'
          }} />

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%'
          }}>
            <Link
              to={`/dashboard/${user.role}`}
              className="btn-solid"
              style={{
                width: '100%',
                padding: '12px',
                justifyContent: 'center',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Return to Workspace <ArrowRight size={16} />
            </Link>
            
            <button
              onClick={logout}
              className="btn-glass"
              style={{
                width: '100%',
                padding: '12px',
                justifyContent: 'center',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
