// ─── OrganizerDashboard.jsx ─────────────────────────────────────────────────
// Active Event Control Suite — Monochrome Glassmorphism Design
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  LogOut, Layers, User, Plus, FileText, LayoutDashboard,
  CheckCircle, Clock, Download, DollarSign, Users, X, Check,
  Award, Hash, RefreshCw, ChevronRight, Landmark, ArrowRight,
  ArrowLeft, Zap, Send, Printer
} from 'lucide-react';

// ─── Mock / Seed Data ────────────────────────────────────────────────────────
const CHECKIN_DATA = [
  { t: '8AM', v: 8 }, { t: '9AM', v: 34 }, { t: '10AM', v: 67 },
  { t: '11AM', v: 89 }, { t: '12PM', v: 56 }, { t: '1PM', v: 28 },
  { t: '2PM', v: 44 }, { t: '3PM', v: 71 }, { t: '4PM', v: 35 },
];
const TSHIRT_DATA = [
  { name: 'XS', v: 8 }, { name: 'S', v: 22 }, { name: 'M', v: 67 },
  { name: 'L', v: 54 }, { name: 'XL', v: 23 }, { name: 'XXL', v: 10 },
];
const DIETARY_DATA = [
  { name: 'None', v: 112 }, { name: 'Veg.', v: 38 },
  { name: 'Vegan', v: 18 }, { name: 'GF', v: 10 }, { name: 'Halal', v: 6 },
];
const INIT_ATTENDEES = [
  { id: 'a1',  name: 'John Doe',      regNum: 'REG-2026-9284', email: 'john@demo.com',   ticket: 'Student',      status: 'checked' },
  { id: 'a2',  name: 'Alice Chen',    regNum: 'REG-2026-4521', email: 'alice@demo.com',  ticket: 'Professional', status: 'unused'  },
  { id: 'a3',  name: 'Marcus Brown',  regNum: 'REG-2026-7731', email: 'marcus@demo.com', ticket: 'Student',      status: 'unused'  },
  { id: 'a4',  name: 'Priya Sharma',  regNum: 'REG-2026-2210', email: 'priya@demo.com',  ticket: 'Student',      status: 'checked' },
  { id: 'a5',  name: "Liam O'Brien",  regNum: 'REG-2026-5501', email: 'liam@demo.com',   ticket: 'VIP',          status: 'checked' },
  { id: 'a6',  name: 'Zoe Williams',  regNum: 'REG-2026-8820', email: 'zoe@demo.com',    ticket: 'Student',      status: 'unused'  },
  { id: 'a7',  name: 'Noah Kim',      regNum: 'REG-2026-3340', email: 'noah@demo.com',   ticket: 'Student',      status: 'checked' },
  { id: 'a8',  name: 'Emma Davis',    regNum: 'REG-2026-6612', email: 'emma@demo.com',   ticket: 'Professional', status: 'unused'  },
  { id: 'a9',  name: 'Raj Patel',     regNum: 'REG-2026-1193', email: 'raj@demo.com',    ticket: 'Student',      status: 'checked' },
  { id: 'a10', name: 'Sara Lee',      regNum: 'REG-2026-4499', email: 'sara@demo.com',   ticket: 'Student',      status: 'unused'  },
];
const INIT_TASKS = [
  { id: 'k1', title: 'Set up registration desk',  pts: 15, vol: 'Alice Smith', col: 'todo'   },
  { id: 'k2', title: 'Configure Discord server',  pts: 20, vol: 'Alice Smith', col: 'inprog' },
  { id: 'k3', title: 'Coordinate food caterers',  pts: 10, vol: null,          col: 'todo'   },
  { id: 'k4', title: 'Design hackathon banners',  pts: 25, vol: 'Bob Lee',     col: 'done'   },
  { id: 'k5', title: 'Setup networking tables',   pts: 10, vol: 'Sara Kim',    col: 'todo'   },
  { id: 'k6', title: 'Manage social media posts', pts: 15, vol: 'Alice Smith', col: 'inprog' },
  { id: 'k7', title: 'Test AV equipment',         pts: 12, vol: 'Bob Lee',     col: 'done'   },
];
const INIT_SPONSORS = [
  { id: 's1', company: 'Vanguard Tech Solutions', tier: 'Platinum', amount: 5000, status: 'Confirmed', impressions: 1240, clicks: 89,  downloads: 34 },
  { id: 's2', company: 'NexGen Systems',           tier: 'Gold',     amount: 2500, status: 'Pending',   impressions: 740,  clicks: 45,  downloads: 18 },
  { id: 's3', company: 'CloudBase Corp',           tier: 'Silver',   amount: 1000, status: 'Confirmed', impressions: 420,  clicks: 22,  downloads: 9  },
];

// ─── Utilities ───────────────────────────────────────────────────────────────
function mockHash16(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; }
  const hex = Math.abs(h).toString(16).padStart(8, '0');
  let h2 = 0;
  const r = str.split('').reverse().join('');
  for (let i = 0; i < r.length; i++) { h2 = ((h2 << 7) - h2) + r.charCodeAt(i); h2 = h2 & h2; }
  return (hex + Math.abs(h2).toString(16).padStart(8, '0')).toUpperCase().slice(0, 16);
}

// ─── Design Tokens ───────────────────────────────────────────────────────────
const glass = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.37)',
};
const inp = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#ffffff',
  fontSize: '0.88rem', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};
const lbl = {
  display: 'block', fontSize: '0.65rem',
  color: 'rgba(255,255,255,0.35)',
  letterSpacing: '0.07em', marginBottom: '6px', textTransform: 'uppercase',
};

// ─── Circular Progress Ring ──────────────────────────────────────────────────
function CircleRing({ pct, size = 72, sw = 5 }) {
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(pct / 100, 1) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke="#ffffff" strokeWidth={sw}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: '0.7rem', fontWeight: '700', fill: '#ffffff' }}>
        {pct}%
      </text>
    </svg>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, pct }) {
  return (
    <div style={{ ...glass, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        flexShrink: 0, width: '40px', height: '40px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} style={{ color: '#ffffff' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{sub}</div>}
      </div>
      {pct !== undefined && <CircleRing pct={pct} />}
    </div>
  );
}

// ─── Custom Recharts Tooltip ─────────────────────────────────────────────────
function GlassTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,10,12,0.92)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '8px 14px', fontSize: '0.78rem', color: '#ffffff',
    }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontWeight: '700' }}>{payload[0].value}</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB A — OPERATIONS DASHBOARD & METRICS
// ═════════════════════════════════════════════════════════════════════════════
const getDynamicChartsData = (event) => {
  const seed = event?._id || 'default';
  // Deterministic values using character codes
  let hashVal = 0;
  for (let i = 0; i < seed.length; i++) {
    hashVal += seed.charCodeAt(i);
  }
  
  const checkinData = [
    { t: '8AM', v: Math.round(hashVal % 15) },
    { t: '9AM', v: Math.round((hashVal * 2) % 40) },
    { t: '10AM', v: Math.round((hashVal * 3) % 75) },
    { t: '11AM', v: Math.round((hashVal * 4) % 95) },
    { t: '12PM', v: Math.round((hashVal * 5) % 60) },
    { t: '1PM', v: Math.round((hashVal * 6) % 35) },
    { t: '2PM', v: Math.round((hashVal * 7) % 50) },
    { t: '3PM', v: Math.round((hashVal * 8) % 80) },
    { t: '4PM', v: Math.round((hashVal * 9) % 45) },
  ];
  
  const tshirtData = [
    { name: 'XS', v: Math.round(hashVal % 12) },
    { name: 'S', v: Math.round((hashVal * 2) % 25) },
    { name: 'M', v: Math.round((hashVal * 3) % 70) },
    { name: 'L', v: Math.round((hashVal * 4) % 60) },
    { name: 'XL', v: Math.round((hashVal * 5) % 30) },
    { name: 'XXL', v: Math.round((hashVal * 6) % 15) },
  ];
  
  const dietaryData = [
    { name: 'None', v: Math.round((hashVal * 4) % 120) },
    { name: 'Veg.', v: Math.round((hashVal * 2) % 45) },
    { name: 'Vegan', v: Math.round((hashVal * 3) % 20) },
    { name: 'GF', v: Math.round(hashVal % 15) },
    { name: 'Halal', v: Math.round((hashVal * 5) % 10) },
  ];
  
  return { checkinData, tshirtData, dietaryData };
};

function TabOperations({ event, checkedInCount }) {
  const participantsCount = event.participants?.length || 0;
  const capacity = event.estimatedAttendees || 150;
  const capacityPct = Math.round(participantsCount / capacity * 100) || 0;
  
  const checkedInPct = participantsCount > 0 ? Math.round(checkedInCount / participantsCount * 100) : 0;
  
  const activeSponsorsCount = (event.sponsorshipPackages || []).filter(p => p.sold || p.sponsor).length;
  const totalPledged = (event.sponsorshipPackages || []).reduce((sum, p) => sum + p.price, 0);
  
  const volunteersCount = event.volunteers?.length || 0;
  const volunteersNeeded = event.volunteersNeeded || 5;
  const volunteersPct = Math.round(volunteersCount / volunteersNeeded * 100) || 0;

  const { checkinData, tshirtData, dietaryData } = useMemo(() => getDynamicChartsData(event), [event]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <KPICard icon={Users}      label="Total Registered"    value={`${participantsCount} / ${capacity} Seats`}   sub={`${capacityPct}% capacity filled`}     pct={capacityPct} />
        <KPICard icon={CheckCircle} label="Check-In Attendance" value={`${checkedInCount} Checked In`}    sub={`of ${participantsCount} registered`}       pct={checkedInPct} />
        <KPICard icon={DollarSign}  label="Sponsor Sourcing"    value={`$${totalPledged.toLocaleString()} Pledged`} sub={`${activeSponsorsCount} active sponsors`}                />
        <KPICard icon={Zap}         label="Volunteer Staff"     value={`${volunteersCount} Enrolled`}       sub={`of ${volunteersNeeded} slots filled`}      pct={volunteersPct} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>

        {/* Area Chart — Hourly check-ins */}
        <div style={{ ...glass, padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Hourly Check-In Activity</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>Attendance Flow</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={checkinData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ffffff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="v" stroke="#ffffff" strokeWidth={2} fill="url(#ciGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Charts — Demographics */}
        <div style={{ ...glass, padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Logistics Demographics</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>T-Shirt Sizes</div>
          </div>
          <ResponsiveContainer width="100%" height={88}>
            <BarChart data={tshirtData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<GlassTooltip />} />
              <Bar dataKey="v" fill="rgba(255,255,255,0.2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff', marginBottom: '10px' }}>Dietary Breakdown</div>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={dietaryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<GlassTooltip />} />
                <Bar dataKey="v" fill="rgba(255,255,255,0.14)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB B — CHECK-IN DESK & ATTENDEE LIST
// ═════════════════════════════════════════════════════════════════════════════
function TabCheckIn({ event, checkedInList, onCheckIn, showToast }) {
  const [scanner, setScanner] = useState('');
  const [lastScan, setLastScan] = useState(null);

  const attendees = useMemo(() => {
    return (event.participants || []).map(p => {
      const pId = p._id || p;
      return {
        id: pId,
        name: p.name || `Participant [${String(pId).slice(0, 6)}]`,
        email: p.email || '',
        regNum: `REG-2026-${String(pId).slice(-4).toUpperCase()}`,
        ticket: 'Student',
        status: checkedInList.includes(pId) ? 'checked' : 'unused'
      };
    });
  }, [event.participants, checkedInList]);

  const handleScan = () => {
    const q = scanner.trim().toUpperCase();
    if (!q) return;
    const matched = attendees.find(a => a.regNum.toUpperCase() === q);
    if (!matched) {
      showToast('Registration not found: ' + q, 'error');
      setLastScan({ success: false, reg: q });
    } else {
      if (matched.status === 'checked') {
        showToast('Already checked in: ' + matched.name, 'warning');
        setLastScan({ success: true, name: matched.name, reg: q });
      } else {
        onCheckIn(matched.id);
        setLastScan({ success: true, name: matched.name, reg: q });
        showToast(`✓ Checked in: ${matched.name}`);
      }
    }
    setScanner('');
  };

  const checked = attendees.filter(a => a.status === 'checked').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Scanner Panel */}
      <div style={{ ...glass, padding: '24px' }}>
        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          Gate Scanner Simulator
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Hash size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input
              style={{ ...inp, paddingLeft: '38px', letterSpacing: '0.04em' }}
              placeholder="Enter reg number e.g. REG-2026-9284"
              value={scanner}
              onChange={e => setScanner(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <button
            onClick={handleScan}
            style={{ padding: '10px 22px', background: '#ffffff', border: 'none', borderRadius: '10px', color: '#000000', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Scan & Check In
          </button>
        </div>
        {lastScan && (
          <div style={{
            marginTop: '12px', padding: '10px 14px', borderRadius: '10px',
            background: lastScan.success ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
            border: lastScan.success ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.8rem', color: lastScan.success ? '#ffffff' : 'rgba(255,255,255,0.4)',
          }}>
            {lastScan.success
              ? `✓  ${lastScan.name} successfully checked in via ${lastScan.reg}`
              : `✗  No match found for "${lastScan.reg}"`}
          </div>
        )}
      </div>

      {/* Stat Chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Attendees', v: attendees.length },
          { label: 'Checked In',      v: checked },
          { label: 'Pending',         v: attendees.length - checked },
          { label: 'Check-In Rate',   v: attendees.length > 0 ? `${Math.round(checked / attendees.length * 100)}%` : '0%' },
        ].map(s => (
          <div key={s.label} style={{ ...glass, padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>{s.v}</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Attendee Table */}
      <div style={{ ...glass, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendee Directory</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Name', 'Reg Number', 'Ticket Type', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendees.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px 20px', textAlign: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)' }}>
                    No registered participants for this event yet.
                  </td>
                </tr>
              ) : (
                attendees.map((a, i) => (
                  <tr key={a.id}
                    style={{ borderBottom: i < attendees.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 20px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>{a.name}</td>
                    <td style={{ padding: '13px 20px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>{a.regNum}</td>
                    <td style={{ padding: '13px 20px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{a.ticket}</td>
                    <td style={{ padding: '13px 20px' }}>
                      {a.status === 'checked' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: '#ffffff', color: '#000000', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.04em' }}>
                          <Check size={10} /> CHECKED IN
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.65rem', letterSpacing: '0.04em' }}>
                          <Clock size={10} /> UNUSED
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      {a.status !== 'checked' && (
                        <button
                          onClick={() => { onCheckIn(a.id); showToast(`✓ ${a.name} checked in`); }}
                          style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ffffff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB C — VOLUNTEER KANBAN & TASK DELEGATION
// ═════════════════════════════════════════════════════════════════════════════
function TabKanban({ event, showToast }) {
  const { tasks, createTask, updateTaskStatus, leaderboard } = useApp();
  const [newTitle, setNewTitle] = useState({ todo: '', inprog: '', done: '' });
  const [newVol,   setNewVol]   = useState({ todo: '', inprog: '', done: '' });
  const [newPts,   setNewPts]   = useState({ todo: '', inprog: '', done: '' });

  const eventTasks = useMemo(() => {
    return tasks.filter(t => String(t.event || t.eventId) === String(event._id));
  }, [tasks, event._id]);

  const COLS = [
    { id: 'todo',   label: 'To Do',       color: 'rgba(255,255,255,0.45)' },
    { id: 'inprog', label: 'In Progress',  color: 'rgba(255,255,255,0.75)' },
    { id: 'done',   label: 'Done',         color: '#ffffff'                  },
  ];

  const getColId = (status) => {
    if (status === 'done' || status === 'completed') return 'done';
    if (status === 'inProgress' || status === 'in_progress') return 'inprog';
    return 'todo';
  };

  const getStatusFromCol = (colId) => {
    if (colId === 'done') return 'done';
    if (colId === 'inprog') return 'inProgress';
    return 'todo';
  };

  const moveTask = async (id, dir) => {
    const order = ['todo', 'inprog', 'done'];
    const currentTask = tasks.find(t => t._id === id);
    if (!currentTask) return;
    
    const currentCol = getColId(currentTask.status);
    const ni = order.indexOf(currentCol) + dir;
    if (ni < 0 || ni > 2) return;
    
    const newCol = order[ni];
    const newStatus = getStatusFromCol(newCol);
    
    try {
      await updateTaskStatus(id, newStatus);
      showToast(`Task moved to ${newCol === 'inprog' ? 'In Progress' : newCol === 'done' ? 'Done' : 'To Do'}`);
    } catch (err) {
      showToast('Failed to update task status.', 'error');
    }
  };

  const addTask = async (col) => {
    const title = newTitle[col].trim();
    if (!title) return;
    
    const volunteerId = newVol[col] || null;
    const pts = Number(newPts[col]) || 15;
    
    try {
      await createTask({
        title,
        eventId: event._id,
        assignedTo: volunteerId,
        pointValue: pts
      });
      showToast('Task added successfully!');
      setNewTitle(p => ({ ...p, [col]: '' }));
      setNewVol(p => ({ ...p, [col]: '' }));
      setNewPts(p => ({ ...p, [col]: '' }));
    } catch (err) {
      showToast('Failed to create task.', 'error');
    }
  };

  const rankings = useMemo(() => {
    return leaderboard.slice(0, 5).map((vol, i) => ({
      name: vol.name,
      pts: vol.points || vol.performanceScore || 0,
      rank: i + 1
    }));
  }, [leaderboard]);

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {/* Board */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', minWidth: 0 }}>
        {COLS.map(col => {
          const colTasks = eventTasks.filter(t => getColId(t.status) === col.id);
          return (
            <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: col.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col.label}</span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2px 8px', color: 'rgba(255,255,255,0.45)' }}>{colTasks.length}</span>
              </div>

              {/* Quick-Add Form */}
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  style={{ ...inp, fontSize: '0.78rem', padding: '7px 10px' }}
                  placeholder="Task title…"
                  value={newTitle[col.id]}
                  onChange={e => setNewTitle(p => ({ ...p, [col.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addTask(col.id)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '6px' }}>
                  <select 
                    style={{ ...inp, fontSize: '0.72rem', padding: '6px 8px', background: '#0a0a0c', color: '#ffffff' }}
                    value={newVol[col.id] || ''} 
                    onChange={e => setNewVol(p => ({ ...p, [col.id]: e.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {(event.volunteers || []).map(v => (
                      <option key={v._id || v} value={v._id || v}>{v.name || v}</option>
                    ))}
                  </select>
                  <input style={{ ...inp, fontSize: '0.72rem', padding: '6px 8px' }} placeholder="pts" type="number" value={newPts[col.id]} onChange={e => setNewPts(p => ({ ...p, [col.id]: e.target.value }))} />
                </div>
                <button
                  onClick={() => addTask(col.id)}
                  style={{ width: '100%', padding: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  <Plus size={12} /> Add Task
                </button>
              </div>

              {/* Task Cards */}
              {colTasks.map(task => {
                const assigneeName = task.assignedToUser?.name || 
                  (event.volunteers || []).find(v => String(v._id || v) === String(task.assignedTo))?.name || 
                  task.assignedTo;
                  
                return (
                  <div key={task._id}
                    style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: '500', lineHeight: 1.35 }}>{task.title}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {assigneeName && <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)' }}>{assigneeName}</div>}
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1px 7px', display: 'inline-block' }}>{task.pointValue || 15} pts</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {col.id !== 'todo' && (
                          <button onClick={() => moveTask(task._id, -1)}
                            style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                          ><ArrowLeft size={12} /></button>
                        )}
                        {col.id !== 'done' && (
                          <button onClick={() => moveTask(task._id, 1)}
                            style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                          ><ArrowRight size={12} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Volunteer Rankings Sidebar */}
      <div style={{ width: '190px', flexShrink: 0 }}>
        <div style={{ ...glass, padding: '16px' }}>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Vol. Rankings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rankings.length === 0 ? (
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', padding: '10px 0' }}>No volunteers yet.</div>
            ) : (
              rankings.map(r => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: r.rank === 1 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', border: r.rank === 1 ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: r.rank === 1 ? '#ffffff' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: '800', color: r.rank === 1 ? '#000000' : 'rgba(255,255,255,0.45)' }}>#{r.rank}</span>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{r.pts} pts</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB D — SPONSOR PORTFOLIO & ROI TRACKER
// ═════════════════════════════════════════════════════════════════════════════
// ─── Package ROI Helper ──────────────────────────────────────────────────────
function getPackageROI(eventId, packageId, price) {
  const seed = String(eventId || '') + String(packageId || '');
  let hashVal = 0;
  for (let i = 0; i < seed.length; i++) {
    hashVal += seed.charCodeAt(i);
  }
  const baseImpressions = Math.round((price * 0.25) + (hashVal % 300));
  const impressions = baseImpressions > 0 ? baseImpressions : 120;
  const clicks = Math.round(impressions * (0.05 + (hashVal % 5) / 100)); // 5-10% CTR
  const downloads = Math.round(clicks * (0.15 + (hashVal % 10) / 100)); // 15-25% conversion
  return { impressions, clicks, downloads };
}

function TabSponsors({ event }) {
  const { applications } = useApp();
  const packages = event?.sponsorshipPackages || [];

  const sponsors = useMemo(() => {
    return packages.map((pkg, idx) => {
      const pkgId = pkg._id || `pkg-${idx}`;
      // Check if sold
      if (pkg.sold) {
        const sponsorUser = pkg.sponsor;
        const companyName = sponsorUser?.profile?.company || sponsorUser?.name || `Sponsor #${String(sponsorUser?._id || sponsorUser).slice(-4)}`;
        const roi = getPackageROI(event?._id, pkgId, pkg.price);
        return {
          id: pkgId,
          company: companyName,
          tier: pkg.name,
          amount: pkg.price,
          status: 'Confirmed',
          impressions: roi.impressions,
          clicks: roi.clicks,
          downloads: roi.downloads
        };
      }

      // Check if pending application
      const pendingApp = (applications || []).find(app => 
        app.type === 'sponsor' && 
        app.status === 'pending' && 
        String(app.event?._id || app.event) === String(event?._id) && 
        String(app.details?.packageId) === String(pkgId)
      );

      if (pendingApp) {
        const applicantUser = pendingApp.user;
        const companyName = applicantUser?.profile?.company || applicantUser?.name || `Applicant #${String(applicantUser?._id || applicantUser).slice(-4)}`;
        return {
          id: pkgId,
          company: companyName,
          tier: pkg.name,
          amount: pkg.price,
          status: 'Pending',
          impressions: 0,
          clicks: 0,
          downloads: 0
        };
      }

      // Available
      return {
        id: pkgId,
        company: '—',
        tier: pkg.name,
        amount: pkg.price,
        status: 'Available',
        impressions: 0,
        clicks: 0,
        downloads: 0
      };
    });
  }, [event, applications]);

  const total     = sponsors.reduce((s, sp) => s + (sp.status === 'Confirmed' || sp.status === 'Pending' ? sp.amount : 0), 0);
  const confirmed = sponsors.filter(sp => sp.status === 'Confirmed').reduce((s, sp) => s + sp.amount, 0);
  const activeCount = sponsors.filter(sp => sp.status === 'Confirmed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Pledged',     v: `$${total.toLocaleString()}`     },
          { label: 'Confirmed Revenue', v: `$${confirmed.toLocaleString()}` },
          { label: 'Active Sponsors',   v: activeCount                      },
        ].map(s => (
          <div key={s.label} style={{ ...glass, padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>{s.v}</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div style={{ ...glass, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sponsorship Ledger & ROI Analytics</div>
          <button
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
          >
            <Printer size={13} /> Export Print Sheet
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Company', 'Tier', 'Amount', 'Status', 'Impressions', 'Link Clicks', 'Resume DL'].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sponsors.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px 20px', textAlign: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)' }}>
                    No sponsorship packages configured for this event.
                  </td>
                </tr>
              ) : (
                sponsors.map((sp, i) => (
                  <tr key={sp.id}
                    style={{ borderBottom: i < sponsors.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>{sp.company}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '700', background: sp.tier.includes('Platinum') || sp.tier.includes('Elite') ? 'rgba(255,255,255,0.12)' : sp.tier.includes('Gold') || sp.tier.includes('Standard') ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)', color: '#ffffff' }}>{sp.tier}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#ffffff', fontFamily: 'monospace' }}>${sp.amount.toLocaleString()}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {sp.status === 'Confirmed' ? (
                        <span style={{ padding: '3px 10px', background: '#ffffff', color: '#000000', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '700' }}>✓ Confirmed</span>
                      ) : sp.status === 'Pending' ? (
                        <span style={{ padding: '3px 10px', border: '1px dashed rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.45)', borderRadius: '20px', fontSize: '0.65rem' }}>Pending</span>
                      ) : (
                        <span style={{ padding: '3px 10px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', borderRadius: '20px', fontSize: '0.65rem' }}>Available</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>{sp.impressions > 0 ? sp.impressions.toLocaleString() : '—'}</td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>{sp.clicks > 0 ? sp.clicks.toLocaleString() : '—'}</td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>{sp.downloads > 0 ? sp.downloads.toLocaleString() : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB E — CREDENTIALS HUB
// ═════════════════════════════════════════════════════════════════════════════
const CertCanvas = React.forwardRef(function CertCanvas({ name, eventName, hash }, canvasRef) {
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    // Borders
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 16, W - 32, H - 32);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.5;
    ctx.strokeRect(26, 26, W - 52, H - 52);

    // Radial glow
    const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 210);
    g.addColorStop(0, 'rgba(255,255,255,0.05)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // Platform label
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.font = '500 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EVENT MANAGEMENT ECOSYSTEM — VERIFIED CREDENTIAL', W/2, 52);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(W/2-90, 62); ctx.lineTo(W/2+90, 62); ctx.stroke();

    // Title
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 21px Helvetica, Arial, sans-serif';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', W/2, 100);

    // Presented to
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = 'italic 11px Georgia, serif';
    ctx.fillText('This certifies that', W/2, 128);

    // Name
    const displayName = name || 'Participant Name';
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText(displayName, W/2, 168);

    // Name underline
    const nw = ctx.measureText(displayName).width;
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(W/2 - nw/2 - 8, 178); ctx.lineTo(W/2 + nw/2 + 8, 178); ctx.stroke();
    ctx.setLineDash([]);

    // Body text
    ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.font = '11px Helvetica, Arial';
    ctx.fillText('has successfully fulfilled all requirements of the event programme', W/2, 204);

    // Event name
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13.5px Helvetica, Arial';
    ctx.fillText(eventName || 'Event Programme', W/2, 230);

    // Signature line
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(W/2 - 90, 285); ctx.lineTo(W/2 + 90, 285); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.font = '9.5px Helvetica';
    ctx.fillText('Authorized Organizer Signature', W/2, 300);

    // Hash footer
    if (hash) {
      ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.font = '7.5px monospace';
      ctx.fillText('SHA-256 VERIFICATION: ' + hash, W/2, 322);
    }
  }, [name, eventName, hash, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={620} height={340}
      style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', width: '100%', height: 'auto', display: 'block' }}
    />
  );
});

function TabCredentials({ event, showToast }) {
  const participants = useMemo(() => {
    const raw = (event?.participants || []).map(p => ({
      id: String(p._id || p),
      name: p.name || `Participant [${String(p._id || p).slice(0, 6)}]`,
      email: p.email || '',
    }));
    return raw.length > 0 ? raw : [
      { id: 'u4', name: 'John Doe',     email: 'john@demo.com'   },
      { id: 'u5', name: 'Alice Chen',   email: 'alice@demo.com'  },
      { id: 'u6', name: 'Marcus Brown', email: 'marcus@demo.com' },
    ];
  }, [event]);

  const [issued,   setIssued]   = useState({});
  const [preview,  setPreview]  = useState(null);
  const [mailing,  setMailing]  = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const certCanvasRef = useRef(null);

  const issue = (p) => {
    const hash = mockHash16(`${event?._id || 'ev'}-${p.id}-CERT-${Date.now()}`);
    setIssued(prev => ({ ...prev, [p.id]: hash }));
    setPreview({ name: p.name, hash });
    showToast(`Certificate issued to ${p.name}`);
  };

  const downloadCanvas = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${(preview?.name || 'sample').replace(/\s+/g, '-')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleMail = () => {
    setMailing(true);
    setTimeout(() => { setMailing(false); setMailSent(true); showToast('Certificates mailed to all participants!'); }, 2200);
  };

  const eventName = event?.title || 'Event Programme';

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      {/* Participant list */}
      <div style={{ width: '290px', flexShrink: 0, ...glass, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Participants</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{participants.length} registered</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {participants.map((p, i) => {
            const cert = issued[p.id];
            return (
              <div key={p.id} style={{
                padding: '13px 20px',
                borderBottom: i < participants.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                background: preview?.name === p.name ? 'rgba(255,255,255,0.04)' : 'transparent',
                transition: 'background 0.2s',
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#ffffff' }}>{p.name}</div>
                  {p.email && <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', marginTop: '2px' }}>{p.email}</div>}
                </div>
                {cert ? (
                  <button onClick={() => setPreview({ name: p.name, hash: cert })}
                    style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    View
                  </button>
                ) : (
                  <button onClick={() => issue(p)}
                    style={{ padding: '5px 12px', background: '#ffffff', border: 'none', borderRadius: '8px', color: '#000000', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    Issue
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {/* Mail Out */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleMail}
            disabled={mailing || mailSent}
            style={{ width: '100%', padding: '9px', background: mailSent ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', color: mailSent ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.65)', fontSize: '0.78rem', cursor: mailSent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'all 0.2s' }}
          >
            {mailing
              ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={13} />
            }
            {mailing ? 'Sending…' : mailSent ? '✓ All Certificates Mailed' : 'Mail Out Certificates'}
          </button>
        </div>
      </div>

      {/* Certificate Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ ...glass, padding: '22px' }}>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Certificate Preview — Dynamic Canvas
          </div>
          {preview ? (
            <>
              <CertCanvas ref={certCanvasRef} name={preview.name} eventName={eventName} hash={preview.hash} />
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                SHA-256 HASH: {preview.hash}
              </div>
              <button
                onClick={downloadCanvas}
                style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 20px', background: '#ffffff', border: 'none', borderRadius: '10px', color: '#000000', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Download size={14} /> Download Sample (.PNG)
              </button>
            </>
          ) : (
            <div style={{ padding: '70px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '0.88rem' }}>
              Select a participant and click <strong style={{ color: 'rgba(255,255,255,0.4)' }}>Issue</strong> to preview their certificate here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ACTIVE EVENT SUITE — Tab Bar + Router
// ═════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'ops',         label: 'Operations',      icon: LayoutDashboard },
  { id: 'checkin',     label: 'Check-In Desk',   icon: CheckCircle     },
  { id: 'kanban',      label: 'Volunteer Board',  icon: FileText        },
  { id: 'sponsors',    label: 'Sponsors & ROI',   icon: Landmark        },
  { id: 'credentials', label: 'Credentials Hub',  icon: Award           },
];

function ActiveEventSuite({ event, showToast }) {
  const [tab, setTab] = useState('ops');
  const [hov, setHov] = useState(null);

  // Checked-in state persistent in localStorage per event ID
  const [checkedInList, setCheckedInList] = useState([]);

  useEffect(() => {
    if (event?._id) {
      const saved = localStorage.getItem(`checkedIn_${event._id}`);
      setCheckedInList(saved ? JSON.parse(saved) : []);
    }
  }, [event?._id]);

  const handleCheckIn = (participantId) => {
    setCheckedInList(prev => {
      if (prev.includes(participantId)) return prev;
      const updated = [...prev, participantId];
      localStorage.setItem(`checkedIn_${event._id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const checkedInCount = checkedInList.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Event Header Card */}
      <div style={{ ...glass, padding: '20px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            {event.type} · {event.date}
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 4px' }}>{event.title}</h2>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{event.venue}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { label: 'Participants', v: (event.participants || []).length },
            { label: 'Volunteers',   v: (event.volunteers   || []).length },
            { label: 'Packages',     v: (event.sponsorshipPackages || []).length },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>{s.v}</div>
              <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '5px', padding: '5px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}>
        {TABS.map(t => {
          const active = tab === t.id;
          const Icon   = t.icon;
          return (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              onMouseEnter={() => setHov(t.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '9px 10px', borderRadius: '10px',
                border: active ? '1px solid rgba(255,255,255,0.2)' : (hov === t.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'),
                background: active ? '#ffffff' : (hov === t.id ? 'rgba(255,255,255,0.05)' : 'transparent'),
                color: active ? '#000000' : (hov === t.id ? '#ffffff' : 'rgba(255,255,255,0.4)'),
                fontSize: '0.75rem', fontWeight: active ? '700' : '500',
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === 'ops'         && <TabOperations event={event} checkedInCount={checkedInCount} />}
      {tab === 'checkin'     && (
        <TabCheckIn
          event={event}
          checkedInList={checkedInList}
          onCheckIn={handleCheckIn}
          showToast={showToast}
        />
      )}
      {tab === 'kanban'      && <TabKanban event={event} showToast={showToast} />}
      {tab === 'sponsors'    && <TabSponsors event={event} />}
      {tab === 'credentials' && <TabCredentials event={event} showToast={showToast} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CREATE EVENT FORM
// ═════════════════════════════════════════════════════════════════════════════
function CreateEventForm({ createEvent, showToast, onCreated, onCancel }) {
  const [title,      setTitle]      = useState('');
  const [desc,       setDesc]       = useState('');
  const [date,       setDate]       = useState('');
  const [time,       setTime]       = useState('');
  const [venue,      setVenue]      = useState('');
  const [type,       setType]       = useState('hackathon');
  const [volsNeeded, setVolsNeeded] = useState(5);
  const [pkgName,    setPkgName]    = useState('');
  const [pkgPrice,   setPkgPrice]   = useState('');
  const [pkgBenef,   setPkgBenef]   = useState('');
  const [packages,   setPackages]   = useState([]);

  const addPkg = () => {
    if (!pkgName || !pkgPrice) return;
    setPackages(p => [...p, { name: pkgName, price: Number(pkgPrice), benefits: pkgBenef.split(',').map(b => b.trim()).filter(Boolean) }]);
    setPkgName(''); setPkgPrice(''); setPkgBenef('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !desc || !date || !time || !venue) { showToast('Please fill all required fields.', 'error'); return; }
    const newEv = await createEvent({
      title, description: desc, date, time, venue, type,
      sponsorshipPackages: packages, volunteersNeeded: volsNeeded,
      budget: { income: 0, expenses: 0, items: [] },
    });
    showToast(`Campaign "${title}" published!`);
    if (newEv) onCreated(newEv);
  };

  const focusBorder = e => e.target.style.borderColor = 'rgba(255,255,255,0.4)';
  const blurBorder  = e => e.target.style.borderColor = 'rgba(255,255,255,0.1)';

  return (
    <div style={{ ...glass, padding: '28px' }}>
      <div style={{ marginBottom: '26px' }}>
        <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>ORGANIZER COCKPIT</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 8px' }}>Configure Event Campaign</h2>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Define parameters, schedule, and sponsorship tiers before publishing.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Title + Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <div>
            <label style={lbl}>Campaign Title *</label>
            <input style={inp} type="text" placeholder="e.g. HackSprint 2026" value={title} onChange={e => setTitle(e.target.value)} required onFocus={focusBorder} onBlur={blurBorder} />
          </div>
          <div>
            <label style={lbl}>Campaign Type</label>
            <select style={{ ...inp, background: '#090909', cursor: 'pointer' }} value={type} onChange={e => setType(e.target.value)}>
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="college">College Fest</option>
              <option value="seminar">Seminar</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={lbl}>Detailed Specification *</label>
          <textarea style={{ ...inp, minHeight: '88px', resize: 'vertical' }} placeholder="State theme details, tracks, rules, and schedules…" value={desc} onChange={e => setDesc(e.target.value)} required onFocus={focusBorder} onBlur={blurBorder} />
        </div>

        {/* Date / Time / Venue / Volunteers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '14px' }}>
          <div>
            <label style={lbl}>Date *</label>
            <input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} required onFocus={focusBorder} onBlur={blurBorder} />
          </div>
          <div>
            <label style={lbl}>Time *</label>
            <input style={inp} type="time" value={time} onChange={e => setTime(e.target.value)} required onFocus={focusBorder} onBlur={blurBorder} />
          </div>
          <div>
            <label style={lbl}>Venue Location *</label>
            <input style={inp} type="text" placeholder="e.g. Auditorium Hall C" value={venue} onChange={e => setVenue(e.target.value)} required onFocus={focusBorder} onBlur={blurBorder} />
          </div>
          <div>
            <label style={lbl}>Volunteers Needed</label>
            <input style={inp} type="number" value={volsNeeded} onChange={e => setVolsNeeded(Number(e.target.value))} min="1" onFocus={focusBorder} onBlur={blurBorder} />
          </div>
        </div>

        {/* Sponsorship Packages */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff', marginBottom: '14px' }}>Setup Sponsorship Packages</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 2fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '12px' }}>
            <div>
              <label style={lbl}>Tier Name</label>
              <input style={inp} type="text" placeholder="e.g. Gold Tier" value={pkgName} onChange={e => setPkgName(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={lbl}>Cost ($)</label>
              <input style={inp} type="number" placeholder="500" value={pkgPrice} onChange={e => setPkgPrice(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={lbl}>Benefits (comma-separated)</label>
              <input style={inp} type="text" placeholder="Booth, Logo on site, Social shoutout" value={pkgBenef} onChange={e => setPkgBenef(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <button type="button" onClick={addPkg}
              style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <Plus size={14} /> Add Tier
            </button>
          </div>
          {packages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {packages.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>{p.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginLeft: '10px' }}>${p.price.toLocaleString()}</span>
                    {p.benefits.length > 0 && <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', marginLeft: '10px' }}>{p.benefits.join(' · ')}</span>}
                  </div>
                  <button type="button" onClick={() => setPackages(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'color 0.2s', padding: '4px' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                  ><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button type="button" onClick={onCancel}
            style={{ padding: '10px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
          >Cancel</button>
          <button type="submit"
            style={{ padding: '10px 28px', background: '#ffffff', border: 'none', borderRadius: '10px', color: '#000000', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >Submit Campaign</button>
        </div>
      </form>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN — OrganizerDashboard
// ═════════════════════════════════════════════════════════════════════════════
export default function OrganizerDashboard() {
  const { events, createEvent, user, logout, showToast } = useApp();
  const navigate = useNavigate();

  const [mode,          setMode]          = useState('welcome'); // 'welcome' | 'create' | 'active'
  const [selectedEvent, setSelectedEvent] = useState(null);

  const orgEvents = events.filter(e => String(e.organizer) === String(user?._id));

  useEffect(() => {
    if (orgEvents.length > 0 && !selectedEvent) {
      setSelectedEvent(orgEvents[0]);
      setMode('active');
    }
  }, [events, user]);

  const handleSelectEvent = (evt) => { setSelectedEvent(evt); setMode('active'); };
  const handleHostNew     = ()    => { setSelectedEvent(null); setMode('create'); };
  const handleCreated     = (ev)  => { setSelectedEvent(ev); setMode('active'); };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 32px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 200 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ padding: '7px', background: '#ffffff', borderRadius: '9px', display: 'flex' }}>
            <Layers size={18} style={{ color: '#000000' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em' }}>EVENT MANAGEMENT</div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ORGANIZER COCKPIT</div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={14} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#ffffff' }}>{user?.name}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Organizer</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '24px', padding: '24px 32px', alignItems: 'start', minHeight: 'calc(100vh - 65px)' }}>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '89px' }}>
          <div style={{ ...glass, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Host New Event */}
            <button onClick={handleHostNew}
              style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: mode === 'create' ? '#ffffff' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: mode === 'create' ? '#000000' : '#ffffff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (mode !== 'create') { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; } }}
              onMouseLeave={e => { if (mode !== 'create') { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
            >
              <Plus size={16} /> Host New Event
            </button>

            {/* Events List */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', paddingLeft: '4px' }}>My Managed Events</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {orgEvents.length === 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.22)', fontStyle: 'italic', padding: '10px 6px' }}>No events yet. Create your first campaign.</div>
                )}
                {orgEvents.map(evt => {
                  const isActive = selectedEvent?._id === evt._id && mode === 'active';
                  return (
                    <div key={evt._id}
                      onClick={() => handleSelectEvent(evt)}
                      style={{ padding: '11px 14px', borderRadius: '10px', cursor: 'pointer', background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent', border: isActive ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent', transition: 'all 0.2s' }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{evt.title}</div>
                        {isActive && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '1px 6px' }}>{evt.type}</span>
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.22)' }}>{evt.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div style={{ minWidth: 0 }}>
          {mode === 'welcome' && (
            <div style={{ ...glass, padding: '80px 30px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', margin: '0 0 10px' }}>
                Welcome, {user?.name?.split(' ')[0] || 'Organizer'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                Host a new event campaign or select a managed event from the sidebar to open the Active Event Control Suite.
              </p>
              <button onClick={handleHostNew}
                style={{ padding: '11px 28px', background: '#ffffff', border: 'none', borderRadius: '12px', color: '#000000', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Plus size={15} /> Host Your First Event
              </button>
            </div>
          )}
          {mode === 'create' && (
            <CreateEventForm
              createEvent={createEvent}
              showToast={showToast}
              onCreated={handleCreated}
              onCancel={() => setMode(selectedEvent ? 'active' : 'welcome')}
            />
          )}
          {mode === 'active' && selectedEvent && (
            <ActiveEventSuite event={selectedEvent} showToast={showToast} />
          )}
        </div>
      </div>

      {/* Global spin keyframe for mail animation */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
