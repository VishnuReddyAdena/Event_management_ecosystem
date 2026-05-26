import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const rolePaths = {
  organizer: '/login/organizer',
  volunteer: '/login/volunteer',
  participant: '/login/participant',
  sponsor: '/login/sponsor',
};

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useApp();
  const location = useLocation();

  // Show spinner while auth state resolves
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
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

  // Logged in but wrong role → silently redirect to THEIR own dashboard
  // (no error page — just navigate them where they belong)
  if (allowedRole && user.role !== allowedRole) {
    const correctDash = `/dashboard/${user.role}`;
    return <Navigate to={correctDash} replace />;
  }

  return children;
}
