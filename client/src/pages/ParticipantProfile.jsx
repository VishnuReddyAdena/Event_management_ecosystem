import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft, User, Shield, GraduationCap, Mail, Hash,
  MapPin, BookOpen, Layers, Award, Star, Edit3, Save, X, LogOut
} from 'lucide-react';

// ─── Field Display Row ────────────────────────────────────────────────────────
function FieldRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      padding: '14px 18px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px'
    }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', color: value ? '#ffffff' : 'rgba(255,255,255,0.3)', fontWeight: '500', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>
          {value || 'Not Provided'}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Field Card (icon card wrapping a live input) ──────────────────────
function EditFieldCard({ icon: Icon, label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      padding: '14px 18px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px'
    }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: '2px'
      }}>
        <Icon size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
        {children}
      </div>
    </div>
  );
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────
function StatBadge({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      padding: '16px 20px',
      background: highlight ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '14px', flex: 1
    }}>
      <div style={{ fontSize: '1.55rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center' }}>{label}</div>
    </div>
  );
}

// ─── Participant Profile Page ──────────────────────────────────────────────────
export default function ParticipantProfile() {
  const { user, setUser, showToast, logout } = useApp();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    collegeName: user?.profile?.collegeName || '',
    collegeAddress: user?.profile?.collegeAddress || '',
    studentId: user?.profile?.studentId || '',
    yearOfStudy: user?.profile?.yearOfStudy || '',
    major: user?.profile?.major || '',
    dietaryRestrictions: user?.profile?.dietaryRestrictions || 'None'
  });

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: formData.name,
      profile: {
        ...user?.profile,
        collegeName: formData.collegeName,
        collegeAddress: formData.collegeAddress,
        studentId: formData.studentId,
        yearOfStudy: formData.yearOfStudy,
        major: formData.major,
        dietaryRestrictions: formData.dietaryRestrictions
      }
    };
    setUser(updatedUser);
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex(u => u._id === user?._id);
    if (idx !== -1) {
      mockUsers[idx] = updatedUser;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }
    localStorage.setItem('mock_user_session', JSON.stringify(updatedUser));
    showToast('Profile updated successfully!');
    setIsEditing(false);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', color: '#ffffff',
    fontSize: '0.88rem', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s'
  };
  const labelStyle = {
    display: 'block', fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.07em', marginBottom: '6px', textTransform: 'uppercase'
  };
  // Input style used inside EditFieldCard cards
  const cardInputStyle = {
    width: '100%', padding: '6px 0px',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    color: '#ffffff',
    fontSize: '0.9rem', fontWeight: '500',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const initials = (formData.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 32px',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, zIndex: 200
      }}>
        {/* Left — brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ padding: '7px', background: '#ffffff', borderRadius: '9px', display: 'flex' }}>
            <Layers size={18} style={{ color: '#000000' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em' }}>EVENT MANAGEMENT</div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PARTICIPANT PROFILE</div>
          </div>
        </Link>

        {/* Right — back + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboard/participant')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9px', color: 'rgba(255,255,255,0.7)',
              fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <ArrowLeft size={14} /> Back to Panel
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', color: 'rgba(255,255,255,0.5)',
              fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Page heading */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>PARTICIPANT PANEL</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.03em', margin: 0 }}>Your Profile</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem', marginTop: '6px' }}>View and update your registered credentials and preferences.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* ── Left Sidebar ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Avatar card */}
            <div style={{
              padding: '28px 20px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
              textAlign: 'center'
            }}>
              {/* Avatar circle */}
              <div style={{
                width: '88px', height: '88px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: '800', color: '#ffffff',
                boxShadow: 'inset 0 0 24px rgba(255,255,255,0.04)'
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>{formData.name || 'Unnamed'}</div>
                <div style={{
                  fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                  letterSpacing: '0.1em', marginTop: '4px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '2px 10px', borderRadius: '6px', display: 'inline-block'
                }}>{user?.role || 'Participant'}</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', wordBreak: 'break-all' }}>{user?.email}</div>

              {/* Verified badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)'
              }}>
                <Shield size={12} style={{ color: 'rgba(255,255,255,0.6)' }} /> Verified Account
              </div>
            </div>

            {/* Stats */}
            <div style={{
              padding: '18px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Quick Stats</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <StatBadge label="Points" value="450" highlight />
                <StatBadge label="Rank" value="#14" />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <StatBadge label="Events" value="3" />
                <StatBadge label="Certs" value="1" />
              </div>
            </div>
          </div>

          {/* ── Right Content ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Section: Personal Info */}
            <section style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Personal Information</span>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '7px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '9px', color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                /* ── Edit Form — styled as FieldRow cards ─────────────── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                  {/* Email — read-only */}
                  <EditFieldCard icon={Mail} label="Email Address">
                    <input
                      readOnly
                      value={user?.email || ''}
                      style={{ ...cardInputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                    />
                  </EditFieldCard>

                  {/* Full Name */}
                  <EditFieldCard icon={User} label="Full Name">
                    <input
                      style={cardInputStyle}
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                      placeholder="Your full name"
                    />
                  </EditFieldCard>

                  {/* College / Student ID — 2 col */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <EditFieldCard icon={BookOpen} label="College / University">
                      <input
                        style={cardInputStyle}
                        value={formData.collegeName}
                        onChange={e => setFormData(p => ({ ...p, collegeName: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                        placeholder="Your college name"
                      />
                    </EditFieldCard>
                    <EditFieldCard icon={Hash} label="Student ID">
                      <input
                        style={{ ...cardInputStyle, fontFamily: 'monospace' }}
                        value={formData.studentId}
                        onChange={e => setFormData(p => ({ ...p, studentId: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                        placeholder="e.g. CS2024001"
                      />
                    </EditFieldCard>
                  </div>

                  {/* Branch / Year — 2 col */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <EditFieldCard icon={GraduationCap} label="Branch / Major">
                      <input
                        style={cardInputStyle}
                        value={formData.major}
                        onChange={e => setFormData(p => ({ ...p, major: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                        placeholder="e.g. Computer Science"
                      />
                    </EditFieldCard>
                    <EditFieldCard icon={Star} label="Year of Study">
                      <select
                        style={{ ...cardInputStyle, background: '#0a0a0a', cursor: 'pointer' }}
                        value={formData.yearOfStudy}
                        onChange={e => setFormData(p => ({ ...p, yearOfStudy: e.target.value }))}
                      >
                        <option value="">Select Year…</option>
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                      </select>
                    </EditFieldCard>
                  </div>

                  {/* College Address — full width */}
                  <EditFieldCard icon={MapPin} label="College Address">
                    <input
                      style={cardInputStyle}
                      value={formData.collegeAddress}
                      onChange={e => setFormData(p => ({ ...p, collegeAddress: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                      placeholder="Campus address"
                    />
                  </EditFieldCard>

                  {/* Dietary Restrictions — full width */}
                  <EditFieldCard icon={Award} label="Dietary Restrictions">
                    <select
                      style={{ ...cardInputStyle, background: '#0a0a0a', cursor: 'pointer' }}
                      value={formData.dietaryRestrictions}
                      onChange={e => setFormData(p => ({ ...p, dietaryRestrictions: e.target.value }))}
                    >
                      <option>None</option>
                      <option>Vegetarian</option>
                      <option>Vegan</option>
                      <option>Gluten Free</option>
                      <option>Halal</option>
                      <option>Kosher</option>
                    </select>
                  </EditFieldCard>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '6px' }}>
                    <button
                      onClick={() => {
                        setFormData({
                          name: user?.name || '',
                          collegeName: user?.profile?.collegeName || '',
                          collegeAddress: user?.profile?.collegeAddress || '',
                          studentId: user?.profile?.studentId || '',
                          yearOfStudy: user?.profile?.yearOfStudy || '',
                          major: user?.profile?.major || '',
                          dietaryRestrictions: user?.profile?.dietaryRestrictions || 'None'
                        });
                        setIsEditing(false);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 22px', background: '#ffffff', border: 'none', borderRadius: '10px', color: '#000000', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <Save size={14} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View Mode ───────────────────────────────────────── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <FieldRow icon={Mail} label="Email Address" value={user?.email} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <FieldRow icon={BookOpen} label="College / University" value={formData.collegeName} />
                    <FieldRow icon={Hash} label="Student ID" value={formData.studentId} mono />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <FieldRow icon={GraduationCap} label="Branch / Major" value={formData.major} />
                    <FieldRow icon={Star} label="Year of Study" value={formData.yearOfStudy} />
                  </div>
                  <FieldRow icon={MapPin} label="College Address" value={formData.collegeAddress} />
                  <FieldRow icon={Award} label="Dietary Restrictions" value={formData.dietaryRestrictions} />
                </div>
              )}
            </section>

            {/* Section: Account Details */}
            <section style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Shield size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Account Details</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <FieldRow icon={User} label="Display Name" value={formData.name} />
                <FieldRow icon={Mail} label="Account Role" value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Participant'} />
              </div>
              <div style={{ marginTop: '10px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                Your account is verified and in good standing. To change your email or password, please contact the event management administrator.
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
