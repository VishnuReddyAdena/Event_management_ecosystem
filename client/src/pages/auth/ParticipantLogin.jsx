import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Laptop, Eye, EyeOff, ArrowLeft, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ParticipantLogin() {
  const { login, signup, user } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('participant@platform.com');
  const [password, setPassword] = useState('volunteer123');
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeAddress, setCollegeAddress] = useState('');
  const [studentId, setStudentId] = useState('');
  const [year, setYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (user && user.role === 'participant') navigate('/dashboard/participant');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const u = await login(email, password);
        if (u && u.role !== 'participant') {
          setError('These credentials belong to a different role. Please use the correct portal.');
          return;
        }
        navigate('/dashboard/participant');
      } else {
        await signup(name, email, password, 'participant', {
          collegeName,
          collegeAddress,
          studentId,
          year
        });
        navigate('/dashboard/participant');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', textDecoration: 'none', marginBottom: '32px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
        >
          <ArrowLeft size={14} /> back
        </Link>
        <div style={{ padding: '40px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', backdropFilter: 'blur(24px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', gap: '14px' }}>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
              <Laptop size={28} style={{ color: '#ffffff' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>PARTICIPANT PANEL</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff' }}>{mode === 'login' ? 'Sign In' : 'Register'}</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '10px', marginBottom: '24px' }}>
            <Layers size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>Access locked to <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Event Participant</strong> role only</span>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>FULL NAME</label>
                  <input className="input-glass" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>COLLEGE NAME</label>
                  <input className="input-glass" type="text" placeholder="Harvard University" value={collegeName} onChange={e => setCollegeName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>COLLEGE ADDRESS</label>
                  <input className="input-glass" type="text" placeholder="123 Science Center Rd, Boston" value={collegeAddress} onChange={e => setCollegeAddress(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>STUDENT ID (College ID Card Number)</label>
                  <input className="input-glass" type="text" placeholder="ID-8923412" value={studentId} onChange={e => setStudentId(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>YEAR OF STUDY</label>
                  <select className="input-glass" value={year} onChange={e => setYear(e.target.value)} required style={{ background: '#0a0a0c', color: '#ffffff' }}>
                    <option value="">Select Year...</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>EMAIL ADDRESS</label>
              <input className="input-glass" type="email" placeholder="participant@platform.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>PASSWORD</label>
              <input className="input-glass" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', bottom: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <div style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>✗ {error}</div>}
            <button type="submit" className="btn-solid" disabled={loading} style={{ width: '100%', marginTop: '6px', padding: '13px' }}>
              {loading ? 'Authenticating...' : (mode === 'login' ? 'Access Participant Panel' : 'Create Participant Account')}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
            {mode === 'login' ? <span>New here? <button onClick={() => { setMode('register'); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem' }}>Register</button></span> : <span>Have an account? <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem' }}>Sign In</button></span>}
          </div>
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.74rem', color: 'rgba(255,255,255,0.2)' }}>Demo: participant@platform.com / volunteer123</div>
        </div>
      </div>
    </div>
  );
}
