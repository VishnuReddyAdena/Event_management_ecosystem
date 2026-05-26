import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Laptop, LogOut, ArrowLeft, Ticket, Award, FileCheck, QrCode,
  Download, CheckCircle, Clock, User, Mail, Hash, ToggleLeft, ToggleRight,
  Layers, Shield, GraduationCap, RefreshCw, LayoutDashboard, Trophy, CalendarDays
} from 'lucide-react';

// ─── SHA-256 Mock Hash Generator ────────────────────────────────────────────
function mockSHA256(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const extra = input.split('').reverse().join('');
  let h2 = 0;
  for (let i = 0; i < extra.length; i++) {
    h2 = ((h2 << 7) - h2) + extra.charCodeAt(i);
    h2 = h2 & h2;
  }
  const hex2 = Math.abs(h2).toString(16).padStart(8, '0');
  return (hex + hex2 + hex + hex2).toUpperCase().slice(0, 64);
}

// ─── QR Matrix Generator ──────────────────────────────────────────────────
function buildQRMatrix(seed) {
  const size = 21;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const addFinder = (r, c) => {
    for (let dr = 0; dr < 7; dr++) for (let dc = 0; dc < 7; dc++) {
      const border = dr === 0 || dr === 6 || dc === 0 || dc === 6;
      const center = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
      if (border || center) matrix[r + dr][c + dc] = 1;
    }
  };
  addFinder(0, 0); addFinder(0, 14); addFinder(14, 0);
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h) + seed.charCodeAt(i); h = h & h; }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue;
    matrix[r][c] = ((h >> (r + c)) & 1) ^ (r % 2 === 0 ? 1 : 0);
  }
  return matrix;
}

// ─── Navigation Bar ───────────────────────────────────────────────────────
function NavBar({ user, logout, activeTab, setActiveTab, onProfileClick }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '24px 32px',
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      position: 'sticky', top: 0, zIndex: 200
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{ padding: '7px', background: '#ffffff', borderRadius: '9px', display: 'flex' }}>
          <Layers size={18} style={{ color: '#000000' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em' }}>EVENT MANAGEMENT</div>
          <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PARTICIPANT PANEL</div>
        </div>
      </Link>

      {/* Centered Hero Bar with Card Layout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10
      }}>
        {[
          {
            id: 'dashboard',
            label: 'Dashboard',
            sub: 'Overview, quick ticket & feed',
            icon: LayoutDashboard
          },
          {
            id: 'events',
            label: 'Events Directory',
            sub: 'Explore hackathons & workshops',
            icon: CalendarDays
          },
          {
            id: 'leaderboard',
            label: 'Leaderboard',
            sub: 'View global rankings & points',
            icon: Trophy
          }
        ].map(item => {
          const Icon = item.icon;
          const active = item.id === 'dashboard'
            ? ['dashboard', 'register', 'tickets', 'certificates', 'certificate-gen'].includes(activeTab)
            : activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                borderRadius: '14px',
                border: active ? '1px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.08)',
                background: active ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                textAlign: 'left',
                backdropFilter: 'blur(20px)',
                boxShadow: active ? '0 4px 20px rgba(255,255,255,0.05)' : 'none'
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                }
              }}
            >
              {/* Icon Container */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: active ? '#ffffff' : 'rgba(255,255,255,0.03)',
                border: active ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease'
              }}>
                <Icon size={14} style={{ color: active ? '#000000' : 'rgba(255,255,255,0.6)' }} />
              </div>
              
              {/* Labels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.85)',
                  lineHeight: 1.1
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: '0.62rem',
                  color: active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.3)',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap'
                }}>
                  {item.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div
          onClick={onProfileClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            transition: 'all 0.2s',
            userSelect: 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={14} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#ffffff' }}>{user?.name}</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Participant</div>
          </div>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </header>
  );
}

// ─── QR Ticket Modal ──────────────────────────────────────────────────────
function QRTicketModal({ ticket, onClose }) {
  const [checkedIn, setCheckedIn] = useState(ticket.checkInStatus === 'Checked In');
  const [checkInTime, setCheckInTime] = useState(ticket.checkInTime || null);
  const matrix = useMemo(() => buildQRMatrix(ticket.secureCheckInHash), [ticket.secureCheckInHash]);
  const blockSize = 8;
  const svgSize = 21 * blockSize;

  const handleToggle = () => {
    if (!checkedIn) {
      setCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString());
    } else {
      setCheckedIn(false);
      setCheckInTime(null);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '10px' }}>
            <Ticket size={22} style={{ color: '#ffffff' }} />
          </div>
          <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: '700' }}>Entry Pass</h3>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', fontFamily: 'monospace', marginTop: '4px' }}>{ticket.registrationNumber}</div>
        </div>

        {/* QR Code */}
        <div style={{ padding: '16px', background: '#ffffff', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
            {matrix.map((row, r) => row.map((val, c) => val ? <rect key={`${r}-${c}`} x={c * blockSize} y={r * blockSize} width={blockSize} height={blockSize} fill="#000000" /> : null))}
          </svg>
        </div>

        {/* Ticket Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'HOLDER', value: ticket.holderName, icon: User },
            { label: 'EVENT', value: ticket.eventTitle, icon: Layers },
            { label: 'DATE & VENUE', value: `${ticket.eventDate} · ${ticket.eventVenue}`, icon: Clock },
            { label: 'TICKET TYPE', value: ticket.ticketType, icon: Ticket },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Icon size={14} style={{ color: 'rgba(255,255,255,0.35)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Check-In Toggle */}
        <div style={{
          padding: '14px 18px',
          borderRadius: '12px',
          border: checkedIn ? '1px solid #ffffff' : '1px dashed rgba(255,255,255,0.25)',
          background: checkedIn ? '#ffffff' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'all 0.3s ease'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: checkedIn ? '#000000' : 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
              {checkedIn ? '✓ CHECKED IN' : 'NOT CHECKED IN'}
            </div>
            {checkedIn && checkInTime && (
              <div style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.5)', marginTop: '2px' }}>Gate scanned at {checkInTime}</div>
            )}
          </div>
          <button onClick={handleToggle} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            {checkedIn
              ? <ToggleRight size={32} style={{ color: '#000000' }} />
              : <ToggleLeft size={32} style={{ color: 'rgba(255,255,255,0.35)' }} />}
          </button>
        </div>

        {/* SHA-256 Hash Footer */}
        <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginBottom: '4px' }}>SHA-256 CHECK-IN HASH</div>
          <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{ticket.secureCheckInHash}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Modal ────────────────────────────────────────────────────────
function ProfileModal({ user, regForm, setRegForm, onClose, showToast }) {
  const { setUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    collegeName: user?.profile?.collegeName || '',
    collegeAddress: user?.profile?.collegeAddress || '',
    studentId: user?.profile?.studentId || '',
    yearOfStudy: user?.profile?.yearOfStudy || '',
    major: regForm?.major || user?.profile?.major || '',
    dietaryRestrictions: regForm?.dietaryRestrictions || user?.profile?.dietaryRestrictions || 'None'
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

    setRegForm(prev => ({
      ...prev,
      firstName: formData.name.split(' ')[0] || '',
      lastName: formData.name.split(' ').slice(1).join(' ') || '',
      collegeName: formData.collegeName,
      studentId: formData.studentId,
      major: formData.major,
      dietaryRestrictions: formData.dietaryRestrictions
    }));

    showToast('Profile updated successfully!');
    setIsEditing(false);
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.07em',
    marginBottom: '4px',
    textTransform: 'uppercase'
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '0.82rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div style={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '32px', maxWidth: '640px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>✕</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
          <User size={20} style={{ color: '#ffffff' }} />
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>Participant Profile</h3>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Official registered credentials & preferences</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '28px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#ffffff', boxShadow: 'inset 0 0 16px rgba(255,255,255,0.05)' }}>
              {formData.name ? formData.name.charAt(0) : 'U'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', wordBreak: 'break-all' }}>{formData.name}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>{user?.role || 'Participant'}</div>
            </div>
            
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Points</span>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ffffff' }}>450 pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Global Rank</span>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ffffff' }}>#14</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>College Name</label>
                    <input style={inputStyle} value={formData.collegeName} onChange={e => setFormData(p => ({ ...p, collegeName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Student ID</label>
                    <input style={inputStyle} value={formData.studentId} onChange={e => setFormData(p => ({ ...p, studentId: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Branch</label>
                    <input style={inputStyle} value={formData.major} onChange={e => setFormData(p => ({ ...p, major: e.target.value }))} placeholder="e.g. Computer Science" />
                  </div>
                  <div>
                    <label style={labelStyle}>Year of Study</label>
                    <select style={{ ...inputStyle, background: '#0a0a0c' }} value={formData.yearOfStudy} onChange={e => setFormData(p => ({ ...p, yearOfStudy: e.target.value }))}>
                      <option value="">Select Year...</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>College Address</label>
                  <input style={inputStyle} value={formData.collegeAddress} onChange={e => setFormData(p => ({ ...p, collegeAddress: e.target.value }))} />
                </div>

                <div>
                  <label style={labelStyle}>Dietary Restrictions</label>
                  <select style={{ ...inputStyle, background: '#0a0a0c' }} value={formData.dietaryRestrictions} onChange={e => setFormData(p => ({ ...p, dietaryRestrictions: e.target.value }))}>
                    <option value="None">None</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten Free">Gluten Free</option>
                    <option value="Halal">Halal</option>
                    <option value="Kosher">Kosher</option>
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>Email Address</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>{user?.email}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>College / University</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>{formData.collegeName || 'Not Provided'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>Student ID / Code</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '500', fontFamily: 'monospace' }}>{formData.studentId || 'Not Provided'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>Academic Branch</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>{formData.major || 'Not Provided'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>Year of Study</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>{formData.yearOfStudy || 'Not Provided'}</div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>College Campus Address</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>{formData.collegeAddress || 'Not Provided'}</div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>Tech Skills</div>
                  {regForm.skills ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {regForm.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                        <span key={skill} style={{ fontSize: '0.68rem', color: '#ffffff', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>No skills added. Add them under Register tab.</div>
                  )}
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>Dietary Restrictions</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>{formData.dietaryRestrictions || 'None'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '8px' }}>
          {isEditing ? (
            <>
              <button 
                type="button" 
                onClick={() => {
                  setFormData({
                    name: user?.name || '',
                    collegeName: user?.profile?.collegeName || '',
                    collegeAddress: user?.profile?.collegeAddress || '',
                    studentId: user?.profile?.studentId || '',
                    yearOfStudy: user?.profile?.yearOfStudy || '',
                    major: regForm?.major || user?.profile?.major || '',
                    dietaryRestrictions: regForm?.dietaryRestrictions || user?.profile?.dietaryRestrictions || 'None'
                  });
                  setIsEditing(false);
                }}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                style={{
                  padding: '8px 20px',
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#000000',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '8px 20px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >
                Edit Profile
              </button>
              <button 
                type="button" 
                onClick={onClose}
                style={{
                  padding: '8px 20px',
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#000000',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Canvas Certificate Generator ─────────────────────────────────────────
function CertificateCanvas({ recipientName, eventName }) {
  const canvasRef = useRef(null);

  const drawCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    // Outer double border
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, W - 36, H - 36);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(26, 26, W - 52, H - 52);

    // Radial ambient glow
    const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 240);
    grd.addColorStop(0, 'rgba(255,255,255,0.04)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Platform label
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '500 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EVENT MANAGEMENT ECOSYSTEM — VERIFIED ACHIEVEMENT', W / 2, 64);

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(W / 2 - 60, 76); ctx.lineTo(W / 2 + 60, 76); ctx.stroke();

    // Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Helvetica, Arial, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', W / 2, 120);
    ctx.letterSpacing = '0px';

    // Presented to
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillText('This is to certify that', W / 2, 158);

    // Recipient name
    const displayName = recipientName.trim() || 'Participant Name';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText(displayName, W / 2, 210);

    // Name underline
    const nameWidth = ctx.measureText(displayName).width;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(W / 2 - nameWidth / 2 - 10, 222); ctx.lineTo(W / 2 + nameWidth / 2 + 10, 222); ctx.stroke();
    ctx.setLineDash([]);

    // Body text
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px Helvetica, Arial';
    ctx.fillText('has successfully completed and graduated from the academic programme', W / 2, 252);

    // Event name
    const displayEvent = eventName.trim() || 'Event Title';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Helvetica, Arial';
    ctx.fillText(`"${displayEvent}"`, W / 2, 295);

    // Security hash
    const hashInput = `${displayName}-${displayEvent}-PLATFORM-2026`;
    const secHash = mockSHA256(hashInput).slice(0, 16).toUpperCase();

    // Signature line
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(90, 360); ctx.lineTo(240, 360); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'italic 11px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText('Sarah Jenkins', 105, 356);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '9px Helvetica';
    ctx.fillText('EVENT CONVENER & DEAN', 95, 374);

    // Verified badge
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '9px monospace';
    ctx.fillText(`SEC: ${secHash}`, W - 40, 374);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 10px Helvetica';
    ctx.fillText('✓ VERIFIED AUTHENTIC', W - 40, 358);

    // Date
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '9px monospace';
    ctx.fillText(`ISSUED: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}`, W / 2, 400);
  }, [recipientName, eventName]);

  useEffect(() => { drawCertificate(); }, [drawCertificate]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Certificate_${(recipientName || 'Participant').replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        width={720}
        height={440}
        style={{ width: '100%', maxWidth: '720px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
      />
      <button
        onClick={handleDownload}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 24px', background: '#ffffff', color: '#000000',
          border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700',
          cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <Download size={16} /> Download Certificate (.PNG)
      </button>
    </div>
  );
}

// ─── Main Participant Panel ────────────────────────────────────────────────
export default function ParticipantPanel() {
  const { user, setUser, events, registerForEvent, certificates, logout, showToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [eventFilter, setEventFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isBarHovered, setIsBarHovered] = useState(false);
  const [skillInputText, setSkillInputText] = useState('');
  const [showProfileModal, _unused] = useState(false); // kept for stability


  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const current = regForm.skills ? regForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (!current.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...current, trimmed].join(', ');
      setRegForm(p => ({ ...p, skills: updated }));
    }
    setSkillInputText('');
  };

  // Registration form state
  const [regForm, setRegForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    selectedEvent: '',
    ticketType: 'Student',
    collegeName: user?.profile?.collegeName || '',
    studentId: user?.profile?.studentId || '',
    major: '',
    expectedGraduation: '',
    skills: '',
    experienceLevel: 'Beginner',
    githubUrl: '',
    linkedinUrl: '',
    tShirtSize: 'M',
    dietaryRestrictions: 'None'
  });
  const [registrations, setRegistrations] = useState(
    JSON.parse(localStorage.getItem(`regs_${user?._id}`) || '[]')
  );
  const [showSuccess, setShowSuccess] = useState(null);

  // Certificate generator state
  const [certName, setCertName] = useState(user?.name || '');
  const [certEvent, setCertEvent] = useState('');

  useEffect(() => {
    if (user) {
      setRegForm(prev => ({
        ...prev,
        firstName: prev.firstName || user.name?.split(' ')[0] || '',
        lastName: prev.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: prev.email || user.email || '',
        collegeName: prev.collegeName || user.profile?.collegeName || '',
        studentId: prev.studentId || user.profile?.studentId || ''
      }));
      setCertName(prev => prev || user.name || '');
    }
  }, [user]);

  const myEvents = useMemo(() =>
    events.filter(evt => (evt.participants || []).some(p => String(p._id || p) === String(user?._id))),
    [events, user]
  );

  const openEvents = useMemo(() =>
    events.filter(evt => !(evt.participants || []).some(p => String(p._id || p) === String(user?._id))),
    [events, user]
  );

  const myCerts = useMemo(() =>
    certificates.filter(c => String(c.user?._id || c.user) === String(user?._id)),
    [certificates, user]
  );

  const combinedEvents = useMemo(() => {
    const todayStr = '2026-05-26';
    const base = events.map(ev => {
      let capacity = "140/200 Filled";
      if (ev._id === 'e2') capacity = "45/50 Filled";
      return {
        ...ev,
        capacity,
        status: ev.date < todayStr ? 'Finished' : (ev.date === todayStr ? 'Ongoing' : 'Upcoming')
      };
    });

    const hasOngoing = base.some(e => e.status === 'Ongoing');
    const hasFinished = base.some(e => e.status === 'Finished');

    if (!hasOngoing) {
      base.push({
        _id: 'e_ongoing',
        title: 'AI Hackathon 2026',
        description: 'Create agentic AI applications with cutting-edge LLMs and framework tools.',
        date: todayStr,
        time: '10:00',
        venue: 'Lab Room 302 & Zoom',
        type: 'hackathon',
        capacity: '88/100 Filled',
        status: 'Ongoing'
      });
    }
    if (!hasFinished) {
      base.push({
        _id: 'e_finished',
        title: 'React Performance Workshop',
        description: 'Profiling React renders, virtual list implementations, and web worker offloading.',
        date: '2026-04-18',
        time: '13:00',
        venue: 'Seminar Hall A',
        type: 'workshop',
        capacity: '60/60 Filled',
        status: 'Finished'
      });
    }

    return base;
  }, [events]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regForm.selectedEvent) { showToast('Please select an event.', 'error'); return; }
    const event = events.find(ev => ev._id === regForm.selectedEvent);
    if (!event) return;

    const regNum = `REG-2026-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const hashInput = `${event._id}-${user._id}-PLATFORM-SALT-2026`;
    const secureHash = mockSHA256(hashInput);

    const newReg = {
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.date,
      eventVenue: event.venue,
      firstName: regForm.firstName,
      lastName: regForm.lastName,
      email: regForm.email,
      ticketType: regForm.ticketType,
      paymentStatus: regForm.ticketType === 'Student' ? 'Free' : 'Completed',
      academicDetails: {
        collegeName: regForm.collegeName,
        studentId: regForm.studentId,
        major: regForm.major,
        expectedGraduation: regForm.expectedGraduation
      },
      hackathonProfile: {
        skills: regForm.skills,
        experienceLevel: regForm.experienceLevel,
        githubUrl: regForm.githubUrl,
        linkedinUrl: regForm.linkedinUrl
      },
      registrationNumber: regNum,
      secureCheckInHash: secureHash,
      checkInStatus: 'Unused',
      logistics: { tShirtSize: regForm.tShirtSize, dietaryRestrictions: regForm.dietaryRestrictions }
    };

    const updated = [...registrations, newReg];
    setRegistrations(updated);
    localStorage.setItem(`regs_${user._id}`, JSON.stringify(updated));
    registerForEvent(event._id);
    setShowSuccess(newReg);
    setActiveTab('tickets');
    setSelectedTicket({ ...newReg, holderName: `${regForm.firstName} ${regForm.lastName}` });
    showToast(`Registration complete! ${regNum}`);
  };

  const tabs = [
    { id: 'register', label: 'Register', icon: FileCheck },
    { id: 'tickets', label: `My Tickets (${registrations.length + myEvents.length})`, icon: Ticket },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'certificate-gen', label: 'Cert Generator', icon: GraduationCap },
  ];

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '9px', color: '#ffffff',
    fontSize: '0.88rem', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block', fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.07em', marginBottom: '6px', textTransform: 'uppercase'
  };

  const sectionStyle = {
    padding: '24px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    marginBottom: '16px'
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <NavBar user={user} logout={() => { logout(); navigate('/'); }} activeTab={activeTab} setActiveTab={setActiveTab} onProfileClick={() => navigate('/dashboard/participant/profile')} />


      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Page Header Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start', marginBottom: '32px' }}>
          {/* Greeting */}
          <div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>PARTICIPANT PANEL</div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.03em', marginBottom: '6px' }}>Welcome, {user?.name?.split(' ')[0]}</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem', lineHeight: 1.5 }}>Manage your event registrations, tickets, certificates and credentials.</p>
          </div>

          {/* Participant Credentials Card */}
          <div style={{
            padding: '20px 24px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <Shield size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffffff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Verified Participant Profile</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', marginBottom: '2px', textTransform: 'uppercase' }}>College Name</div>
                <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: '500' }}>{user?.profile?.collegeName || 'Not Provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', marginBottom: '2px', textTransform: 'uppercase' }}>Student ID / Code</div>
                <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: '500', fontFamily: 'monospace' }}>{user?.profile?.studentId || 'Not Provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', marginBottom: '2px', textTransform: 'uppercase' }}>College Address</div>
                <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: '500' }}>{user?.profile?.collegeAddress || 'Not Provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', marginBottom: '2px', textTransform: 'uppercase' }}>Year of Study</div>
                <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: '500' }}>{user?.profile?.yearOfStudy || 'Not Provided'}</div>
              </div>
            </div>
          </div>
        </div>



        {/* Tab Navigation */}
        {['dashboard', 'register', 'tickets', 'certificates', 'certificate-gen'].includes(activeTab) && (
          <div
            onMouseEnter={() => setIsBarHovered(true)}
            onMouseLeave={() => setIsBarHovered(false)}
            style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '28px',
              background: 'rgba(255,255,255,0.02)',
              border: isBarHovered ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px',
              padding: '5px',
              transition: 'border-color 0.25s ease'
            }}
          >
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              const isHovered = hoveredTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                    padding: '9px 12px', borderRadius: '10px',
                    border: active 
                      ? '1px solid rgba(255,255,255,0.2)' 
                      : (isHovered ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.08)'),
                    background: active 
                      ? '#ffffff' 
                      : (isHovered ? 'rgba(255,255,255,0.06)' : 'transparent'),
                    color: active 
                      ? '#000000' 
                      : (isHovered ? '#ffffff' : 'rgba(255,255,255,0.4)'),
                    fontSize: '0.8rem', fontWeight: active ? '700' : '500',
                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
            {/* Dynamic Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {[
                { label: 'My Total Points', value: '450 pts', sub: 'Accumulated via tasks & submissions' },
                { label: 'Registered Events', value: `${registrations.length + myEvents.length} Active`, sub: 'Active fests / workshops' },
                { label: 'Global Rank', value: '#14', sub: 'Out of all registered students' }
              ].map((metric, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '24px',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {metric.label}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {metric.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                    {metric.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Layout Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {/* Quick Entry Ticket Column */}
              <div style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', margin: 0 }}>
                  Quick Entry Pass
                </h3>
                
                {(() => {
                  const ticket = registrations.length > 0 ? registrations[0] : (myEvents.length > 0 ? {
                    registrationNumber: `TKT-${String(myEvents[0]._id).substr(-6).toUpperCase()}`,
                    eventTitle: myEvents[0].title,
                    eventDate: myEvents[0].date,
                    eventVenue: myEvents[0].venue || 'Tech Auditorium, Building B',
                    ticketType: 'General',
                    checkInStatus: 'Unused',
                    secureCheckInHash: mockSHA256(`${myEvents[0]._id}-${user?._id || 'demo'}`)
                  } : {
                    registrationNumber: "REG-2026-DEMO",
                    eventTitle: "Global Tech Hackathon 2026",
                    eventDate: "2026-07-15",
                    eventVenue: "Tech Auditorium, Building B",
                    ticketType: "Student",
                    checkInStatus: "Unused",
                    secureCheckInHash: mockSHA256("e1-u4-PLATFORM-SALT-2026")
                  });

                  const matrix = buildQRMatrix(ticket.secureCheckInHash || "DEMO");
                  const bSize = 6;
                  const sSize = 21 * bSize;

                  return (
                    <>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ padding: '8px', background: '#ffffff', borderRadius: '10px', display: 'flex' }}>
                          <svg width={sSize} height={sSize} viewBox={`0 0 ${sSize} ${sSize}`}>
                            {matrix.map((row, r) => row.map((val, c) => val ? <rect key={`${r}-${c}`} x={c * bSize} y={r * bSize} width={bSize} height={bSize} fill="#000000" /> : null))}
                          </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>
                            {ticket.eventTitle}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                            {ticket.eventDate}
                          </div>
                          <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>
                            {ticket.registrationNumber}
                          </div>
                          <div style={{
                            alignSelf: 'flex-start',
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            padding: '3px 8px',
                            background: ticket.checkInStatus === 'Checked In' ? '#ffffff' : 'transparent',
                            color: ticket.checkInStatus === 'Checked In' ? '#000000' : 'rgba(255,255,255,0.5)',
                            border: ticket.checkInStatus === 'Checked In' ? '1px solid #ffffff' : '1px dashed rgba(255,255,255,0.25)',
                            borderRadius: '6px',
                            textTransform: 'uppercase'
                          }}>
                            {ticket.checkInStatus || 'Unused'}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedTicket({ ...ticket, holderName: user?.name || 'John Doe' })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '10px',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      >
                        View Full Ticket
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Live Activity Feed Column */}
              <div style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', margin: 0 }}>
                  Live Activity Feed
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                  {[
                    { text: 'Team forming phase initialized for "AI Hackathon 2026".', time: 'Just now' },
                    { text: 'Certificate generated for "React Performance Workshop".', time: '2 hours ago' },
                    { text: 'Registration confirmed for "Global Tech Hackathon 2026".', time: '1 day ago' },
                    { text: 'Sponsorship matching algorithm completed for "Vanguard Tech Solutions".', time: '3 days ago' }
                  ].map((act, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff', margin: '6px 0' }} />
                        {idx !== 3 && <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)' }} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                          {act.text}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
                          {act.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {/* Sub-Navigation Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
              {['All Events', 'Upcoming', 'Ongoing', 'Finished'].map(f => {
                const active = eventFilter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setEventFilter(f)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      border: active ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                      background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.4)',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            {/* Event Catalog Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {combinedEvents
                .filter(ev => eventFilter === 'All Events' || ev.status === eventFilter)
                .map(event => {
                  const isAlreadyRegistered = (event.participants || []).some(p => String(p._id || p) === String(user?._id));
                  const showRegisterBtn = (event.status === 'Upcoming' || event.status === 'Ongoing') && !isAlreadyRegistered;

                  return (
                    <div
                      key={event._id}
                      style={{
                        padding: '24px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(20px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'monospace' }}>
                          {event.type || 'HACKATHON'}
                        </div>
                        <h4 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
                          {event.title}
                        </h4>
                      </div>
                      
                      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
                        {event.description}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                          Date: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{event.date}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                          Venue: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{event.venue}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                          Capacity: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{event.capacity || '140/200 Filled'}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '10px' }}>
                        {/* Status Badge */}
                        {event.status === 'Upcoming' && (
                          <div style={{
                            fontSize: '0.68rem', fontWeight: '600', padding: '4px 10px',
                            border: '1px dashed rgba(255,255,255,0.25)', borderRadius: '6px',
                            color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase'
                          }}>
                            Open for Registration
                          </div>
                        )}
                        {event.status === 'Ongoing' && (
                          <div style={{
                            fontSize: '0.68rem', fontWeight: '700', padding: '4px 10px',
                            background: '#ffffff', color: '#000000', borderRadius: '6px',
                            textTransform: 'uppercase'
                          }}>
                            LIVE NOW
                          </div>
                        )}
                        {event.status === 'Finished' && (
                          <div style={{
                            fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)',
                            textTransform: 'uppercase'
                          }}>
                            Event Concluded
                          </div>
                        )}

                        {/* Action Button */}
                        {showRegisterBtn && (
                          <button
                            type="button"
                            onClick={() => {
                              setRegForm(prev => ({ ...prev, selectedEvent: event._id }));
                              setActiveTab('register');
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#ffffff',
                              color: '#000000',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                          >
                            Register
                          </button>
                        )}
                        {isAlreadyRegistered && (
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                            ✓ Registered
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', margin: 0 }}>
              Global Leaderboard
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Rank', 'Participant', 'Institution', 'Completed Tasks', 'Total Points'].map(head => (
                      <th key={head} style={{ padding: '12px 16px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rank: 1, name: 'Emily Chen', school: 'MIT', tasks: 18, points: 800 },
                    { rank: 2, name: 'Alex Rivera', school: 'Stanford', tasks: 15, points: 720 },
                    { rank: 3, name: 'Sophia Patel', school: 'UC Berkeley', tasks: 14, points: 680 },
                    { rank: 4, name: 'Michael Chang', school: 'Caltech', tasks: 12, points: 610 },
                    { rank: 5, name: 'Liam Johnson', school: 'Georgia Tech', tasks: 11, points: 580 },
                    { rank: 14, name: 'John Doe', school: 'MIT', tasks: 9, points: 450, isActiveUser: true },
                    { rank: 15, name: 'Sarah Connor', school: 'UCLA', tasks: 8, points: 420 },
                  ].map((row, idx) => {
                    const isUser = row.name.toLowerCase() === (user?.name || 'John Doe').toLowerCase() || row.isActiveUser;
                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          ...(isUser ? {
                            background: 'rgba(255,255,255,0.02)',
                            boxShadow: 'inset 0 0 12px rgba(255,255,255,0.03)',
                            outline: '1.5px dashed rgba(255,255,255,0.6)',
                            outlineOffset: '-1.5px'
                          } : {})
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontSize: '0.88rem', color: isUser ? '#ffffff' : 'rgba(255,255,255,0.7)', fontWeight: isUser ? '700' : '500' }}>
                          #{row.rank}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.88rem', color: isUser ? '#ffffff' : 'rgba(255,255,255,0.85)', fontWeight: isUser ? '700' : '500' }}>
                          {row.name} {isUser && <span style={{ fontSize: '0.62rem', background: '#ffffff', color: '#000000', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '800' }}>YOU</span>}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: isUser ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)' }}>
                          {row.school}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: isUser ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)' }}>
                          {row.tasks}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.88rem', color: isUser ? '#ffffff' : 'rgba(255,255,255,0.75)', fontWeight: '700' }}>
                          {row.points} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REGISTRATION TAB */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Personal Details */}
              <div style={sectionStyle}>
                <h3 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} /> Personal Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>First Name *</label>
                      <input style={inputStyle} type="text" required value={regForm.firstName} onChange={e => setRegForm(p => ({...p, firstName: e.target.value}))} placeholder="John" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name *</label>
                      <input style={inputStyle} type="text" required value={regForm.lastName} onChange={e => setRegForm(p => ({...p, lastName: e.target.value}))} placeholder="Doe" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input style={inputStyle} type="email" required value={regForm.email} onChange={e => setRegForm(p => ({...p, email: e.target.value}))} placeholder="john@example.com" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Select Event *</label>
                    <select style={{...inputStyle, background: '#0a0a0a'}} required value={regForm.selectedEvent} onChange={e => setRegForm(p => ({...p, selectedEvent: e.target.value}))}>
                      <option value="">Choose an event...</option>
                      {openEvents.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Ticket Type</label>
                    <select style={{...inputStyle, background: '#0a0a0a'}} value={regForm.ticketType} onChange={e => setRegForm(p => ({...p, ticketType: e.target.value}))}>
                      <option>Student</option>
                      <option>General</option>
                      <option>VIP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div style={sectionStyle}>
                <h3 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={16} /> Academic Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>College / University</label>
                    <input style={inputStyle} value={regForm.collegeName} onChange={e => setRegForm(p => ({...p, collegeName: e.target.value}))} placeholder="MIT" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>Student ID</label>
                      <input style={inputStyle} value={regForm.studentId} onChange={e => setRegForm(p => ({...p, studentId: e.target.value}))} placeholder="CS2024001" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Branch</label>
                      <input style={inputStyle} value={regForm.major} onChange={e => setRegForm(p => ({...p, major: e.target.value}))} placeholder="Computer Science" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Expected Graduation</label>
                    <input style={inputStyle} value={regForm.expectedGraduation} onChange={e => setRegForm(p => ({...p, expectedGraduation: e.target.value}))} placeholder="2026" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                </div>
              </div>

              {/* Hackathon Profile */}
              <div style={sectionStyle}>
                <h3 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Hash size={16} /> Hackathon Profile
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Tech Skills</label>
                    
                    {/* Render Selected Skills as Removable Tags */}
                    {regForm.skills && regForm.skills.split(',').map(s => s.trim()).filter(Boolean).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {regForm.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                          <span
                            key={skill}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: '20px',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: '500'
                            }}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => {
                                const current = regForm.skills.split(',').map(s => s.trim()).filter(Boolean);
                                const updated = current.filter(s => s !== skill).join(', ');
                                setRegForm(p => ({ ...p, skills: updated }));
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                padding: '0 2px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Input field + Add button */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        value={skillInputText}
                        onChange={e => setSkillInputText(e.target.value)}
                        placeholder="Type a skill to add (e.g. React)..."
                        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill(skillInputText);
                          }
                        }}
                      />
                      {skillInputText.trim() && (
                        <button
                          type="button"
                          onClick={() => handleAddSkill(skillInputText)}
                          style={{
                            padding: '0 18px',
                            background: '#ffffff',
                            color: '#000000',
                            border: 'none',
                            borderRadius: '9px',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          Add
                        </button>
                      )}
                    </div>
                    
                    {/* Predefined Suggestions */}
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(() => {
                          const currentSkills = regForm.skills ? regForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
                          const allPredefined = ['React', 'Node.js', 'Python', 'JavaScript', 'SQL', 'Git', 'Figma', 'Java', 'C++', 'Docker', 'HTML', 'CSS', 'TypeScript', 'MongoDB', 'AWS', 'Rust', 'Go'];
                          
                          const filtered = allPredefined.filter(skill => {
                            const isAlreadySelected = currentSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                            if (isAlreadySelected) return false;
                            if (!skillInputText.trim()) return true;
                            return skill.toLowerCase().includes(skillInputText.trim().toLowerCase());
                          });

                          if (filtered.length === 0) return null;

                          return filtered.slice(0, 8).map(skill => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                handleAddSkill(skill);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '5px 10px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '6px',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                              }}
                            >
                              <span>+</span>
                              <span>{skill}</span>
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Experience Level</label>
                    <select style={{...inputStyle, background: '#0a0a0a'}} value={regForm.experienceLevel} onChange={e => setRegForm(p => ({...p, experienceLevel: e.target.value}))}>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>GitHub URL</label>
                    <input style={inputStyle} value={regForm.githubUrl} onChange={e => setRegForm(p => ({...p, githubUrl: e.target.value}))} placeholder="https://github.com/username" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>LinkedIn URL</label>
                    <input style={inputStyle} value={regForm.linkedinUrl} onChange={e => setRegForm(p => ({...p, linkedinUrl: e.target.value}))} placeholder="https://linkedin.com/in/username" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                </div>
              </div>

              {/* Logistics */}
              <div style={sectionStyle}>
                <h3 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} /> Logistics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>T-Shirt Size</label>
                    <select style={{...inputStyle, background: '#0a0a0a'}} value={regForm.tShirtSize} onChange={e => setRegForm(p => ({...p, tShirtSize: e.target.value}))}>
                      <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Dietary Restrictions</label>
                    <select
                      style={{ ...inputStyle, background: '#0a0a0a' }}
                      value={regForm.dietaryRestrictions || 'None'}
                      onChange={e => setRegForm(p => ({ ...p, dietaryRestrictions: e.target.value }))}
                    >
                      <option value="None">None</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                      <option value="Halal">Halal</option>
                      <option value="Kosher">Kosher</option>
                      <option value="Lactose Intolerant">Lactose Intolerant</option>
                      <option value="Nut Allergy">Nut Allergy</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment Method</div>
                    <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                      {regForm.ticketType === 'Student' ? '✓ Free — Student Ticket' : `$${regForm.ticketType === 'VIP' ? '99' : '29'} — Online Payment`}
                    </div>
                  </div>

                  <button type="submit" style={{
                    marginTop: '20px', width: '100%', padding: '14px',
                    background: '#ffffff', color: '#000000',
                    border: 'none', borderRadius: '10px',
                    fontSize: '0.9rem', fontWeight: '700',
                    cursor: 'pointer', transition: 'opacity 0.2s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    Complete Registration & Generate QR Pass
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TICKETS TAB */}
        {activeTab === 'tickets' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {registrations.map(reg => (
                <div key={reg.id} onClick={() => setSelectedTicket({ ...reg, holderName: `${reg.firstName} ${reg.lastName}` })}
                  style={{ padding: '22px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', cursor: 'pointer', transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>QR ENTRY PASS</div>
                    <div style={{ fontSize: '0.65rem', padding: '3px 8px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)' }}>{reg.ticketType}</div>
                  </div>
                  <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>{reg.eventTitle}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>{reg.eventDate} · {reg.eventVenue}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{reg.registrationNumber}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', fontFamily: 'inherit' }}><QrCode size={12} /> Tap to View</span>
                  </div>
                </div>
              ))}
              {myEvents.filter(ev => !registrations.some(r => r.eventId === ev._id)).map(evt => (
                <div key={evt._id} onClick={() => setSelectedTicket({ registrationNumber: `TKT-${String(evt._id).substr(-6).toUpperCase()}`, holderName: user?.name, eventTitle: evt.title, eventDate: evt.date, eventVenue: evt.venue || 'TBD', ticketType: 'General', secureCheckInHash: mockSHA256(`${evt._id}-${user._id}`), checkInStatus: 'Unused' })}
                  style={{ padding: '22px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', cursor: 'pointer', transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>REGISTERED EVENT</div>
                  <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>{evt.title}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>{evt.date}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <QrCode size={12} /> Tap to view QR pass
                  </div>
                </div>
              ))}
              {registrations.length === 0 && myEvents.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                  No tickets yet. Register for an event to generate your QR pass.
                </div>
              )}
            </div>
          </div>
        )}

        {/* CERTIFICATES TAB */}
        {activeTab === 'certificates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myCerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                No certificates issued yet. Complete an event to receive your credential.
              </div>
            ) : myCerts.map(cert => (
              <div key={cert._id} style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'}
              >
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: '4px', textTransform: 'uppercase' }}>DIGITAL CREDENTIAL</div>
                  <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>{cert.eventName}</h4>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>{cert.code}</div>
                  <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>Issued {new Date(cert.issuedAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => { setCertName(cert.recipientName); setCertEvent(cert.eventName); setActiveTab('certificate-gen'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', color: '#000000', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                  <GraduationCap size={14} /> View & Download
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CERTIFICATE GENERATOR TAB */}
        {activeTab === 'certificate-gen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', maxWidth: '600px' }}>
              <div>
                <label style={labelStyle}>Recipient Full Name</label>
                <input style={inputStyle} value={certName} onChange={e => setCertName(e.target.value)} placeholder="John Doe" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label style={labelStyle}>Event / Programme Title</label>
                <input style={inputStyle} value={certEvent} onChange={e => setCertEvent(e.target.value)} placeholder="Global Tech Hackathon 2026" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
            </div>
            <CertificateCanvas recipientName={certName} eventName={certEvent} />
          </div>
        )}
      </main>

      {/* QR Modal */}
      {selectedTicket && <QRTicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  );
}
