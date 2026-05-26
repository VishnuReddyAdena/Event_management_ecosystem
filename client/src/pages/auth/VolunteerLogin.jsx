import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Eye, EyeOff, ArrowLeft, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function VolunteerLogin() {
  const { login, signup, user } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('volunteer@platform.com');
  const [password, setPassword] = useState('volunteer123');
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (user && user.role === 'volunteer') navigate('/dashboard/volunteer');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const u = await login(email, password);
        if (u && u.role !== 'volunteer') {
          setError('These credentials belong to a different role. Please use the correct portal.');
          return;
        }
        navigate('/dashboard/volunteer');
      } else {
        await signup(name, email, password, 'volunteer', { skills: skills.split(',').map(s => s.trim()).filter(Boolean) });
        navigate('/dashboard/volunteer');
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
              <Users size={28} style={{ color: '#ffffff' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>VOLUNTEER HUB</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff' }}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '10px', marginBottom: '24px' }}>
            <Layers size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>Access locked to <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Student Volunteer</strong> role only</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', letterSpacing: '0.04em' }}>FULL NAME</label>
                  <input className="input-glass" type="text" placeholder="Alice Smith" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', letterSpacing: '0.04em' }}>SKILLS (comma separated)</label>
                  <input className="input-glass" type="text" placeholder="React, Python, Logistics" value={skills} onChange={e => setSkills(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', letterSpacing: '0.04em' }}>EMAIL ADDRESS</label>
              <input className="input-glass" type="email" placeholder="volunteer@platform.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', letterSpacing: '0.04em' }}>PASSWORD</label>
              <input className="input-glass" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', bottom: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <div style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>✗ {error}</div>
            )}
            <button type="submit" className="btn-solid" disabled={loading} style={{ width: '100%', marginTop: '6px', padding: '13px' }}>
              {loading ? 'Authenticating...' : (mode === 'login' ? 'Access Volunteer Hub' : 'Create Volunteer Account')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
            {mode === 'login' ? (
              <span>Need an account? <button onClick={() => { setMode('register'); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem' }}>Register</button></span>
            ) : (
              <span>Have an account? <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem' }}>Sign In</button></span>
            )}
          </div>
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.74rem', color: 'rgba(255,255,255,0.2)' }}>
            Demo: volunteer@platform.com / volunteer123
          </div>
        </div>
      </div>
    </div>
  );
}
