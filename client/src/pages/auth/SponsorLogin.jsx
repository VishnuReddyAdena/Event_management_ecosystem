import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, ArrowLeft, Layers, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SponsorLogin() {
  const { login, signup, user, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  
  // Base fields
  const [email, setEmail] = useState('sponsor@platform.com');
  const [password, setPassword] = useState('volunteer123');
  
  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industryFocus, setIndustryFocus] = useState('');
  const [budget, setBudget] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 3-Phase Overlay States
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayPhaseText, setOverlayPhaseText] = useState('');
  const [verificationHash, setVerificationHash] = useState('');
  const [registrationSuccessHash, setRegistrationSuccessHash] = useState('');

  React.useEffect(() => {
    if (user && user.role === 'sponsor') {
      navigate('/dashboard/sponsor');
    }
  }, [user, navigate]);

  React.useEffect(() => {
    if (location.state && location.state.registeredEmail) {
      setEmail(location.state.registeredEmail);
      if (location.state.successHash) {
        setRegistrationSuccessHash(location.state.successHash);
      }
      // Clear navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Crypto SHA-256 helper
  const calculateSHA256 = async (emailStr, roleStr, timestamp) => {
    const msg = `${emailStr.toLowerCase()}${roleStr}${timestamp}`;
    const msgBuffer = new TextEncoder().encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      setLoading(true);
      try {
        const u = await login(email, password);
        if (u && u.role !== 'sponsor') {
          setError('These credentials belong to a different role. Please use the correct portal.');
          setLoading(false);
          return;
        }
        navigate('/dashboard/sponsor');
      } catch (err) {
        setError(err.message || 'Authentication failed.');
        setLoading(false);
      }
    } else {
      // Phase 1: Deep Field Validation
      if (!firstName.trim() || !lastName.trim()) {
        setError('First Name and Last Name are required.');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      if (!companyName.trim()) {
        setError('Company Name is required.');
        return;
      }

      if (!industryFocus.trim()) {
        setError('Please select/specify Industry Focus.');
        return;
      }

      const budgetNum = Number(budget);
      if (isNaN(budgetNum) || budgetNum <= 0) {
        setError('Please enter a valid allocated sponsorship budget greater than 0.');
        return;
      }

      // Validations passed, launch Phase 2
      setLoading(true);
      setShowOverlay(true);
      
      try {
        // Step 1: Init delay
        setOverlayPhaseText('Phase 1: Deep Field Validation Verified...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 2: Hashing credentials
        setOverlayPhaseText('Phase 2: Hashing credentials & compiling register payload...');
        const timestamp = Date.now();
        const hash = await calculateSHA256(email, 'sponsor', timestamp);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 3: Generating signature
        setOverlayPhaseText('Phase 3: Signing transaction payload & generating session keys...');
        setVerificationHash(hash);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Onboarding Redirection
        const profileData = {
          company: companyName,
          industry: industryFocus,
          budget: budgetNum,
          bio: 'Custom corporate event sponsor.'
        };

        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        
        // Add to simulated mock users
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('An account with this email address already exists.');
        }

        const newUserId = 'u_' + Math.random().toString(36).substring(2, 11);
        const storeUser = {
          _id: newUserId,
          userId: newUserId,
          name: fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase(),
          role: 'sponsor',
          profile: profileData,
          profileData,
          verificationHash: hash,
          password: password,
          createdAt: new Date().toISOString()
        };

        mockUsers.push(storeUser);
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));

        setRegistrationSuccessHash(hash);
        setShowOverlay(false);
        setLoading(false);
        setMode('login');
        setPassword('');
        showToast('Registration successful! Please sign in.');
      } catch (err) {
        setError(err.message || 'Registration failed.');
        setShowOverlay(false);
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
      
      {/* 3-Phase Loading Overlay */}
      {showOverlay && (
        <div className="auth-overlay">
          <div className="auth-overlay-card">
            <div className="preloader-spinner" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>Securing Profile</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.45)', lineHeight: '1.4' }}>
                {overlayPhaseText}
              </p>
            </div>
            {verificationHash && (
              <div style={{
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.35)',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                wordBreak: 'break-all',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}>
                <ShieldCheck size={14} style={{ color: '#ffffff', flexShrink: 0 }} />
                <span>HASH: {verificationHash}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '460px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', textDecoration: 'none', marginBottom: '32px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
        >
          <ArrowLeft size={14} /> back
        </Link>
        
        <div style={{ padding: '40px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', backdropFilter: 'blur(24px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', gap: '14px' }}>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
              <Briefcase size={28} style={{ color: '#ffffff' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>SPONSOR COCKPIT</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff' }}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '10px', marginBottom: '24px' }}>
            <Layers size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>Access locked to <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Corporate Sponsor</strong> role only</span>
          </div>

          {registrationSuccessHash && mode === 'login' && (
            <div style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.8rem',
              color: '#ffffff'
            }}>
              <div style={{ fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ✓ Profile Secured & Registered
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontSize: '0.74rem' }}>
                Your verification hash has been recorded in the platform registry.
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.66rem',
                background: 'rgba(0,0,0,0.3)',
                padding: '6px 10px',
                borderRadius: '6px',
                wordBreak: 'break-all',
                color: 'rgba(255,255,255,0.8)'
              }}>
                H: {registrationSuccessHash}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>FIRST NAME</label>
                    <input className="input-glass-premium" type="text" placeholder="Marcus" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>LAST NAME</label>
                    <input className="input-glass-premium" type="text" placeholder="Vance" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>COMPANY NAME</label>
                  <input className="input-glass-premium" type="text" placeholder="Vanguard Tech Solutions" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>INDUSTRY FOCUS</label>
                    <select className="input-glass-premium" value={industryFocus} onChange={e => setIndustryFocus(e.target.value)} required style={{ background: '#0a0a0c', color: '#ffffff' }}>
                      <option value="">Select Industry...</option>
                      <option value="Tech & Software Development">Tech & Software</option>
                      <option value="Education & e-Learning">Education</option>
                      <option value="Finance & Banking">Finance</option>
                      <option value="Healthcare & BioTech">Healthcare</option>
                      <option value="Energy & Environment">Energy & Green</option>
                      <option value="Entertainment & Media">Media & Games</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SPONSORSHIP BUDGET ($)</label>
                    <input className="input-glass-premium" type="number" placeholder="5000" min="1" value={budget} onChange={e => setBudget(e.target.value)} required />
                  </div>
                </div>
              </>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase' }}>EMAIL ADDRESS</label>
              <input className="input-glass-premium" type="email" placeholder="sponsor@platform.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase' }}>PASSWORD</label>
              <input className="input-glass-premium" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', bottom: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <div style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>✗ {error}</div>}
            <button type="submit" className="btn-solid" disabled={loading} style={{ width: '100%', marginTop: '6px', padding: '13px' }}>
              {loading ? 'Processing Securely...' : (mode === 'login' ? 'Access Sponsor Marketplace' : 'Sign Up')}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
            {mode === 'login' ? <span>New here? <button onClick={() => { setMode('register'); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem' }}>Register</button></span> : <span>Have an account? <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem' }}>Sign In</button></span>}
          </div>
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.74rem', color: 'rgba(255,255,255,0.2)' }}>Demo: sponsor@platform.com / volunteer123</div>
        </div>
      </div>
    </div>
  );
}
