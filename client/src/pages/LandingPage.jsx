import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Layers, ArrowRight, Award, ShieldCheck, Sparkles,
  Users, Briefcase, Landmark, Copy
} from 'lucide-react';

export default function LandingPage() {
  const { user, logout, login, verifyCertificate, showToast } = useApp();
  const navigate = useNavigate();

  // Refs for scrolling
  const sections = {
    home: useRef(null),
    portals: useRef(null),
    verifier: useRef(null)
  };

  const scrollToSection = (id) => {
    sections[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ──────────────────────────────────────────────────────────────────────────
  // STAKEHOLDER DIRECTORY DEFINITIONS
  // ──────────────────────────────────────────────────────────────────────────
  const stakeholders = [
    {
      role: 'organizer',
      title: 'Organizer Cockpit',
      subtitle: 'Dr. Sarah Jenkins',
      email: 'organizer@platform.com',
      password: 'volunteer123',
      icon: Landmark,
      description: 'Coordinates hackathons and workshops: manages registrations, tracks budgets, delegates Kanban task cards, and verifies certificates.',
      dashboard: '/dashboard/organizer',
      loginPath: '/login/organizer',
      meta: [
        { label: 'Role Context', value: 'Dean of Computing' },
        { label: 'Phone Support', value: '+1 555-0199' },
        { label: 'Access Level', value: 'Administrator' }
      ]
    },
    {
      role: 'volunteer',
      title: 'Volunteer Hub',
      subtitle: 'Alice Smith',
      email: 'volunteer@platform.com',
      password: 'volunteer123',
      icon: Users,
      description: 'Supports active event operations: claims Kanban tasks, scans attendee QR tickets at check-in gates, and accumulates gamified XP metrics.',
      dashboard: '/dashboard/volunteer',
      loginPath: '/login/volunteer',
      meta: [
        { label: 'Academic Year', value: 'CS Sophomore' },
        { label: 'Performance Score', value: '98/100' },
        { label: 'Gamified Score', value: '1,295 XP' }
      ]
    },
    {
      role: 'sponsor',
      title: 'Sponsor Marketplace',
      subtitle: 'Marcus Vance',
      email: 'sponsor@platform.com',
      password: 'volunteer123',
      icon: Briefcase,
      description: 'Sponsors events: filters hackathons by similarity match indexes (Jaccard similarity), audits sponsorship proposals, and reviews budget reports.',
      dashboard: '/dashboard/sponsor',
      loginPath: '/login/sponsor',
      meta: [
        { label: 'Enterprise', value: 'Vanguard Solutions' },
        { label: 'Industry Focus', value: 'Tech & AI Systems' },
        { label: 'Allocated Budget', value: '$15,000' }
      ]
    },
    {
      role: 'participant',
      title: 'Participant Panel',
      subtitle: 'John Doe',
      email: 'participant@platform.com',
      password: 'volunteer123',
      icon: Award,
      description: 'Attends and competes: registers for active hackathons, displays SHA-256 secure hash-based QR entry passes, and downloads certificates.',
      dashboard: '/dashboard/participant',
      loginPath: '/login/participant',
      meta: [
        { label: 'Enrollment Status', value: 'Full-Stack Student' },
        { label: 'Verified Passes', value: '1 Active Pass' },
        { label: 'Credentials', value: 'Verifiable Cert' }
      ]
    }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC CERTIFICATE VERIFIER STATE & ACTION
  // ──────────────────────────────────────────────────────────────────────────
  const [publicVerifyCode, setPublicVerifyCode] = useState('');
  const [verResult, setVerResult] = useState(null);
  const [verError, setVerError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!publicVerifyCode.trim()) return;
    setVerifying(true);
    setVerResult(null);
    setVerError('');
    try {
      const res = await verifyCertificate(publicVerifyCode.trim());
      if (res && res.verified) {
        setVerResult(res.certificate);
        showToast('Certificate Verified Authentic!');
      } else {
        setVerError('Certificate not found.');
      }
    } catch (err) {
      setVerError(err.message || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS FOR DIRECTORY CARDS
  // ──────────────────────────────────────────────────────────────────────────
  const handleCopyCredentials = (email, password) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`)
        .then(() => showToast('Credentials copied to clipboard!'))
        .catch(() => showToast('Failed to copy to clipboard', 'error'));
    } else {
      const el = document.createElement('textarea');
      el.value = `Email: ${email}\nPassword: ${password}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast('Credentials copied to clipboard!');
    }
  };

  const handleQuickSignIn = async (email, password, dashboardPath) => {
    try {
      showToast('Authenticating session...');
      const u = await login(email, password);
      if (u) {
        navigate(dashboardPath);
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    }
  };

  return (
    <div ref={sections.home} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflowX: 'hidden', background: '#08080A' }}>
      
      {/* CSS styled classes definitions for Liquid Glassmorphism */}
      <style>{`
        /* Floating glows drifting */
        .ambient-glow-1 {
          position: fixed;
          top: -10%;
          left: 10%;
          width: 50vw;
          height: 50vw;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.015);
          filter: blur(140px);
          pointer-events: none;
          z-index: -2;
          animation: drift 25s infinite alternate ease-in-out;
        }
        .ambient-glow-2 {
          position: fixed;
          bottom: -15%;
          right: 15%;
          width: 55vw;
          height: 55vw;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.012);
          filter: blur(160px);
          pointer-events: none;
          z-index: -2;
          animation: drift 20s infinite alternate ease-in-out;
        }
        .ambient-glow-3 {
          position: fixed;
          top: 35%;
          left: 30%;
          width: 45vw;
          height: 45vw;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.01);
          filter: blur(120px);
          pointer-events: none;
          z-index: -2;
          animation: drift 28s infinite alternate ease-in-out;
        }
        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4vw, 4vh) scale(1.08); }
          100% { transform: translate(-2vw, -2vh) scale(0.96); }
        }

        /* Liquid Glass Card Styling */
        .liquid-glass-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
          border-radius: 32px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
        }
        .liquid-glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 40%);
          pointer-events: none;
          transition: opacity 0.3s ease;
          opacity: 0.5;
        }
        .liquid-glass-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.85), inset 0 1px 0 0 rgba(255, 255, 255, 0.12);
          transform: translateY(-4px);
        }
        .liquid-glass-card:hover::before {
          opacity: 1;
        }

        /* Text emphasis ratios */
        .text-high {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }
        .text-med {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }
        .text-low {
          color: rgba(255, 255, 255, 0.4);
          font-weight: 400;
        }

        .portals-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          margin-top: 20px;
        }
        @media (max-width: 900px) {
          .portals-grid {
            grid-template-columns: 1fr !important;
            gap: 24px;
          }
          .hidden-mobile {
            display: none !important;
          }
        }
      `}</style>

      {/* Floating ambient glows & dotted grid background */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="ambient-glow-3" />
      <div className="bg-grid" />

      {/* ──────────────────────────────────────────────────────────────────────────
          1. FLOATING GLOBAL NAVBAR (HERO BAR)
          ────────────────────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: '1200px',
        height: '68px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        zIndex: 1000,
        boxSizing: 'border-box'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ padding: '7px', background: '#ffffff', borderRadius: '8px', display: 'flex' }}>
            <Layers size={17} style={{ color: '#000000' }} />
          </div>
          <div>
            <div className="text-high" style={{ fontSize: '0.92rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
              EVENT MANAGEMENT
            </div>
            <div className="text-low" style={{ fontSize: '0.52rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '1.5px' }}>
              ECOSYSTEM PLATFORM
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="hidden-mobile">
          <button
            onClick={() => scrollToSection('home')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              padding: '12px 0'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('portals')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              padding: '12px 0'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            Portals & Users
          </button>
          <button
            onClick={() => scrollToSection('verifier')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              padding: '12px 0'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            Verifier
          </button>
        </nav>

        {/* CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user ? (
            <>
              <Link to="/login" className="text-high" style={{ fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                Dashboard
              </Link>
              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.78rem',
                  padding: '7px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffffff'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'; }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-high"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
              >
                Sign In
              </Link>
              <Link
                to="/login"
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: '700',
                  padding: '9px 18px',
                  borderRadius: '40px',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  boxShadow: '0 8px 24px rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. MAIN CONTENT (Offset for floating navbar)
          ────────────────────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, width: '100%', margin: '0 auto', boxSizing: 'border-box', paddingTop: '140px' }}>
        
        {/* A. HERO SECTION */}
        <section style={{
          textAlign: 'center',
          padding: '40px 24px 60px 24px',
          maxWidth: '980px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          {/* Centered High-Impact Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 15px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            marginBottom: '28px',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={11} /> THE UNIFIED MULTI-SIDED ECOSYSTEM
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 6.2vw, 4.2rem)',
            lineHeight: 1.08,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            marginBottom: '20px',
            maxWidth: '900px'
          }}>
            The Operating System for Modern Hackathons & Workshops.
          </h1>

          {/* Subtitle */}
          <p className="text-med" style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
            maxWidth: '720px',
            margin: '0 auto',
            lineHeight: 1.65,
            marginBottom: '40px'
          }}>
            Connect organizers, manage registrations with dynamic QR passes, source corporate sponsors with compatibility matching, and coordinate volunteers with gamified Kanban boards.
          </p>

          {/* Double CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollToSection('portals')}
              style={{
                background: '#ffffff',
                color: '#000000',
                fontWeight: '700',
                padding: '13px 30px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '0.88rem',
                boxShadow: '0 10px 30px rgba(255, 255, 255, 0.12)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
            >
              Access Portals <ArrowRight size={16} />
            </button>
            <button
              onClick={() => scrollToSection('verifier')}
              style={{
                background: 'transparent',
                color: '#ffffff',
                fontWeight: '600',
                padding: '13px 30px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
            >
              Verify Credentials
            </button>
          </div>
        </section>

        {/* C. STAKEHOLDER ACCESS PORTALS & ROLES */}
        <section ref={sections.portals} style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '60px 24px 80px 24px',
          boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="text-high" style={{ fontSize: '2.4rem', letterSpacing: '-0.03em', marginBottom: '14px' }}>
              Ecosystem Portals & Roles
            </h2>
            <p className="text-med" style={{ maxWidth: '640px', margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Explore the distinct roles and operational capabilities of each stakeholder within our multi-tenant event management platform.
            </p>
          </div>

          <div className="portals-grid">
            {stakeholders.map((portal) => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.role}
                  className="liquid-glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    padding: '28px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex' }}>
                      <Icon size={20} style={{ color: '#ffffff' }} />
                    </div>
                    <div>
                      <h3 className="text-high" style={{ fontSize: '1.25rem', marginBottom: '2px' }}>{portal.title}</h3>
                      <div className="text-low" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                        Stakeholder: {portal.subtitle}
                      </div>
                    </div>
                  </div>

                  <p className="text-med" style={{ fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>
                    {portal.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* F. PUBLIC CREDENTIAL VERIFIER */}
        <section ref={sections.verifier} style={{
          maxWidth: '680px',
          margin: '0 auto 80px auto',
          padding: '0 24px',
          boxSizing: 'border-box'
        }}>
          <div className="liquid-glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                <ShieldCheck size={20} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <div className="text-high" style={{ fontSize: '1.1rem' }}>Public Certificate Verifier</div>
                <div className="text-low" style={{ fontSize: '0.78rem' }}>Verify platform issued credentials. Try: CERT-WOR-SPRING2026-A1B2C3</div>
              </div>
            </div>

            <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px' }}>
              <input
                className="input-glass"
                value={publicVerifyCode}
                onChange={e => setPublicVerifyCode(e.target.value)}
                placeholder="Enter certificate code"
                required
                style={{ fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn-solid" disabled={verifying} style={{ padding: '0 22px', flexShrink: 0, borderRadius: '8px', fontSize: '0.82rem' }}>
                {verifying ? '...' : 'Verify'}
              </button>
            </form>

            {verResult && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  ✓ CREDENTIAL VERIFIED AUTHENTIC
                </div>
                <div className="text-high" style={{ fontSize: '0.9rem' }}>Recipient: <strong style={{ color: '#ffffff' }}>{verResult.recipientName}</strong></div>
                <div className="text-med" style={{ fontSize: '0.82rem', marginTop: '4px' }}>Event: {verResult.eventName}</div>
                <div className="text-low" style={{ fontSize: '0.76rem', marginTop: '4px' }}>Issued: {new Date(verResult.issuedAt).toLocaleDateString()}</div>
              </div>
            )}

            {verError && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                fontSize: '0.82rem',
                color: 'rgba(255, 255, 255, 0.45)',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                ✗ {verError}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        padding: '30px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.3)',
        flexWrap: 'wrap',
        gap: '16px',
        boxSizing: 'border-box'
      }}>
        <div className="text-low" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
          EVENT MANAGEMENT ECOSYSTEM © 2026. ALL SYSTEMS OPERATIONAL.
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['portals', 'verifier'].map(id => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '0.72rem',
                color: 'rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
                transition: 'color 0.15s',
                textTransform: 'capitalize'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
            >
              {id === 'portals' ? 'Portals & Users' : 'Verifier'}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}