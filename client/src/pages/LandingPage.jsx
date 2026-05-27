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
  // REGISTER POPUP MODAL STATE & ACTIONS
  // ──────────────────────────────────────────────────────────────────────────
  const [signupRole, setSignupRole] = useState(null); // null | 'organizer' | 'volunteer' | 'sponsor' | 'participant'
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Role-specific fields
  const [volunteerSkills, setVolunteerSkills] = useState('');
  const [sponsorCompany, setSponsorCompany] = useState('');
  const [sponsorIndustry, setSponsorIndustry] = useState('Tech & Software Development');
  const [sponsorBudget, setSponsorBudget] = useState('5000');
  const [participantCollegeName, setParticipantCollegeName] = useState('');
  const [participantCollegeAddress, setParticipantCollegeAddress] = useState('');
  const [participantStudentId, setParticipantStudentId] = useState('');
  const [participantYear, setParticipantYear] = useState('');

  const { signup } = useApp();

  const handleOpenSignup = (role) => {
    setSignupRole(role);
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupError('');
    setVolunteerSkills('');
    setSponsorCompany('');
    setSponsorIndustry('Tech & Software Development');
    setSponsorBudget('5000');
    setParticipantCollegeName('');
    setParticipantCollegeAddress('');
    setParticipantStudentId('');
    setParticipantYear('');
  };

  const handleCloseSignup = () => {
    setSignupRole(null);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupEmail)) {
        throw new Error('Please enter a valid email address.');
      }
      if (signupPassword.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      if (!signupName.trim()) {
        throw new Error('Name is required.');
      }

      let profileData = {};
      if (signupRole === 'volunteer') {
        profileData = {
          skills: volunteerSkills.split(',').map(s => s.trim()).filter(Boolean),
          bio: 'CS Sophomore. Active helper.',
          points: 0,
          performanceScore: 100,
          badges: []
        };
      } else if (signupRole === 'sponsor') {
        profileData = {
          company: sponsorCompany,
          industry: sponsorIndustry,
          budget: Number(sponsorBudget) || 0,
          bio: 'Corporate sponsor.'
        };
      } else if (signupRole === 'participant') {
        profileData = {
          collegeName: participantCollegeName,
          collegeAddress: participantCollegeAddress,
          studentId: participantStudentId,
          year: participantYear
        };
      } else if (signupRole === 'organizer') {
        profileData = {
          organization: 'Event Organization Dept',
          designation: 'Staff Organizer',
          phone: '+1 555-0199'
        };
      }

      // Generate verification hash
      const timestamp = Date.now();
      const message = `${signupEmail.toLowerCase()}${signupRole}${timestamp}`;
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Add to simulated mock users
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      if (mockUsers.some(u => u.email.toLowerCase() === signupEmail.toLowerCase())) {
        throw new Error('An account with this email address already exists.');
      }

      const newUserId = 'u_' + Math.random().toString(36).substring(2, 11);
      const storeUser = {
        _id: newUserId,
        userId: newUserId,
        name: signupName,
        firstName: signupName.split(' ')[0] || '',
        lastName: signupName.split(' ').slice(1).join(' ') || '',
        email: signupEmail.toLowerCase(),
        role: signupRole,
        profile: profileData,
        profileData: profileData,
        verificationHash: hash,
        password: signupPassword,
        createdAt: new Date().toISOString()
      };

      mockUsers.push(storeUser);
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));

      showToast('Registration successful! Please sign in.');
      handleCloseSignup();
      navigate(`/login/${signupRole}`, { state: { registeredEmail: signupEmail, successHash: hash } });
    } catch (err) {
      setSignupError(err.message || 'Registration failed.');
    } finally {
      setSignupLoading(false);
    }
  };

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
              <button
                onClick={() => handleOpenSignup('participant')}
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: '700',
                  padding: '9px 18px',
                  borderRadius: '40px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  boxShadow: '0 8px 24px rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
              >
                Get Started
              </button>
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

                  {/* Meta details list */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {portal.meta && portal.meta.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem'
                      }}>
                        <span className="text-low" style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.4)' }}>{item.label}</span>
                        <span className="text-high" style={{
                          fontFamily: 'monospace',
                          fontSize: '0.76rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          color: '#ffffff'
                        }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
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

      {/* ──────────────────────────────────────────────────────────────────────────
          SIGN-UP POPUP MODAL WINDOW (FROSTED LIQUID GLASS)
          ────────────────────────────────────────────────────────────────────────── */}
      {signupRole && (
        <div 
          onClick={handleCloseSignup}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'rgba(10, 10, 12, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '28px',
              padding: '36px',
              boxSizing: 'border-box',
              position: 'relative',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Close button */}
            <button 
              onClick={handleCloseSignup}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: '300' }}>×</span>
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>
                Join the Ecosystem
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', margin: 0, textTransform: 'capitalize' }}>
                Sign Up as {signupRole}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Full Name</label>
                <input 
                  className="input-glass" 
                  type="text" 
                  value={signupName} 
                  onChange={e => setSignupName(e.target.value)} 
                  placeholder={signupRole === 'organizer' ? 'Dr. Sarah Jenkins' : signupRole === 'volunteer' ? 'Alice Smith' : signupRole === 'sponsor' ? 'Marcus Vance' : 'John Doe'} 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email Address</label>
                <input 
                  className="input-glass" 
                  type="email" 
                  value={signupEmail} 
                  onChange={e => setSignupEmail(e.target.value)} 
                  placeholder={`${signupRole}@platform.com`} 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Password</label>
                <input 
                  className="input-glass" 
                  type="password" 
                  value={signupPassword} 
                  onChange={e => setSignupPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              {/* Role-specific Fields */}
              {signupRole === 'volunteer' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Skills (comma separated)</label>
                  <input 
                    className="input-glass" 
                    type="text" 
                    value={volunteerSkills} 
                    onChange={e => setVolunteerSkills(e.target.value)} 
                    placeholder="React, CSS, Logistics, Discord" 
                  />
                </div>
              )}

              {signupRole === 'sponsor' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Company Name</label>
                    <input 
                      className="input-glass" 
                      type="text" 
                      value={sponsorCompany} 
                      onChange={e => setSponsorCompany(e.target.value)} 
                      placeholder="Vanguard Tech Solutions" 
                      required 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Industry</label>
                      <input 
                        className="input-glass" 
                        type="text" 
                        value={sponsorIndustry} 
                        onChange={e => setSponsorIndustry(e.target.value)} 
                        placeholder="Tech & AI" 
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Budget ($)</label>
                      <input 
                        className="input-glass" 
                        type="number" 
                        value={sponsorBudget} 
                        onChange={e => setSponsorBudget(e.target.value)} 
                        placeholder="15000" 
                        required 
                      />
                    </div>
                  </div>
                </>
              )}

              {signupRole === 'participant' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>College Name</label>
                    <input 
                      className="input-glass" 
                      type="text" 
                      value={participantCollegeName} 
                      onChange={e => setParticipantCollegeName(e.target.value)} 
                      placeholder="Harvard University" 
                      required 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Student ID</label>
                      <input 
                        className="input-glass" 
                        type="text" 
                        value={participantStudentId} 
                        onChange={e => setParticipantStudentId(e.target.value)} 
                        placeholder="ID-98242" 
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Year of Study</label>
                      <select 
                        className="input-glass" 
                        value={participantYear} 
                        onChange={e => setParticipantYear(e.target.value)} 
                        required
                        style={{ background: '#0a0a0c', color: '#ffffff' }}
                      >
                        <option value="">Select Year...</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>College Address</label>
                    <input 
                      className="input-glass" 
                      type="text" 
                      value={participantCollegeAddress} 
                      onChange={e => setParticipantCollegeAddress(e.target.value)} 
                      placeholder="123 Science Center Rd, Boston" 
                      required 
                    />
                  </div>
                </>
              )}

              {signupError && (
                <div style={{ padding: '8px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.02)' }}>
                  ✗ {signupError}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-solid" 
                disabled={signupLoading}
                style={{ width: '100%', marginTop: '8px', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700' }}
              >
                {signupLoading ? 'Registering...' : `Create ${signupRole} Account`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}