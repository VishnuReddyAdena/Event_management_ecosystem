import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers, ChevronDown, CheckCircle, ArrowRight, ScanLine, LayoutDashboard, Award, Zap, ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// ─── UTILS & TOKENS ───────────────────────────────────────────────────────────
const glass = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px',
  backdropFilter: 'blur(24px)',
  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)'
};

// ─── NAV BAR ──────────────────────────────────────────────────────────────────
function NavBar({ scrollTo }) {
  return (
    <nav style={{
      position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 64px)', maxWidth: '1200px', height: '64px',
      ...glass, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', zIndex: 1000
    }}>
      {/* Left: Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '7px', background: '#ffffff', borderRadius: '8px', display: 'flex' }}>
          <Layers size={16} style={{ color: '#000000' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>EVENT MANAGEMENT</div>
          <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>ECOSYSTEM PLATFORM</div>
        </div>
      </div>

      {/* Center: Links */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <button onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Core Features</button>
        <button onClick={() => scrollTo('sandbox')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Live Showcase</button>
        <button onClick={() => scrollTo('pricing')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Pricing</button>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
        <Link to="/login/organizer" style={{ background: '#ffffff', color: '#000000', padding: '8px 20px', borderRadius: '40px', fontSize: '0.75rem', fontWeight: '800', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Get Started
        </Link>
      </div>
    </nav>
  );
}

// ─── SANDBOX: SPONSOR MATCHER ─────────────────────────────────────────────────
function SponsorMatcherMock() {
  const [attendees, setAttendees] = useState(1500);
  const [tags, setTags] = useState(['React']);
  
  const toggleTag = t => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  
  // Math: MatchScore(S, E) = 0.4*J_tech + 0.4*J_dom + 0.2*min(1, Ratio)
  // Mock logic for sandbox:
  const baseTags = ['React', 'Solidity', 'Python'];
  const overlap = tags.length;
  const J_tech = overlap / (baseTags.length + tags.length - overlap || 1);
  const ratio = Math.min(1, attendees / 3000);
  const score = Math.round(((0.6 * J_tech) + (0.4 * ratio)) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Algorithmic Matching Engine</h3>
        <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Match Score</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>{score}%</div>
        </div>
      </div>
      <div>
        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '8px' }}>Target Attendees: {attendees}</label>
        <input type="range" min="100" max="5000" step="100" value={attendees} onChange={e => setAttendees(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#ffffff' }} />
      </div>
      <div>
        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '8px' }}>Toggle Target Tags</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {baseTags.map(t => {
            const active = tags.includes(t);
            return (
              <button key={t} onClick={() => toggleTag(t)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', background: active ? '#ffffff' : 'transparent', color: active ? '#000000' : 'rgba(255,255,255,0.6)', border: active ? '1px solid #ffffff' : '1px dashed rgba(255,255,255,0.3)', transition: 'all 0.2s' }}>
                {t}
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ marginTop: 'auto', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
        $$ MatchScore(S, E) = 0.40 \cdot J_{{tech}} + 0.40 \cdot J_{{dom}} + 0.20 \cdot \min(1, Ratio) $$
      </div>
    </div>
  );
}

// ─── SANDBOX: VOLUNTEER KANBAN ────────────────────────────────────────────────
function KanbanMock() {
  const [cols, setCols] = useState({ todo: [1], inProg: [], done: [] });
  const [score, setScore] = useState(120);

  const move = () => {
    if (cols.todo.length > 0) { setCols({ todo: [], inProg: [1], done: [] }); }
    else if (cols.inProg.length > 0) { setCols({ todo: [], inProg: [], done: [1] }); setScore(s => s + 50); }
    else { setCols({ todo: [1], inProg: [], done: [] }); setScore(120); }
  };

  const Card = ({ text }) => (
    <div onClick={move} style={{ padding: '12px', background: '#ffffff', color: '#000000', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,255,255,0.1)' }}>
      {text}
      <div style={{ fontSize: '0.6rem', color: 'rgba(0,0,0,0.5)', marginTop: '4px' }}>Click to move →</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Gamified Operations</h3>
        <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '700', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>John Doe: {score} pts</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', flex: 1 }}>
        {[['To Do', cols.todo], ['In Progress', cols.inProg], ['Done', cols.done]].map(([title, items]) => (
          <div key={title} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>{title}</div>
            {items.map(i => <Card key={i} text="Setup registration desk" />)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SANDBOX: QR SCANNER ──────────────────────────────────────────────────────
function QRMock() {
  const [name, setName] = useState('Alice');
  
  // Create a pseudo-random hash grid based on name
  const hash = name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
  const size = 10;
  const grid = [];
  for(let i=0; i<size; i++){
    for(let j=0; j<size; j++){
      if ((Math.abs(hash ^ (i * 7) ^ (j * 11))) % 2 === 0) {
        grid.push(<rect x={i*10} y={j*10} width="10" height="10" fill="#ffffff" key={`${i}-${j}`}/>);
      }
    }
  }

  // Add position markers
  const Marker = ({ x, y }) => (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="30" height="30" fill="#ffffff" />
      <rect x="5" y="5" width="20" height="20" fill="#000000" />
      <rect x="10" y="10" width="10" height="10" fill="#ffffff" />
    </g>
  );

  return (
    <div style={{ display: 'flex', gap: '40px', height: '100%', alignItems: 'center' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Dynamic Vector Passes</h3>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Type to instantly generate a cryptographic entry pass.</p>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Type Your Name" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }} />
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>SEQ: REG-2026-{Math.abs(hash).toString(16).toUpperCase().substring(0,6)}</div>
      </div>
      <div style={{ width: '180px', height: '180px', background: '#000000', padding: '10px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          {grid}
          <Marker x={0} y={0} />
          <Marker x={70} y={0} />
          <Marker x={0} y={70} />
        </svg>
      </div>
    </div>
  );
}

// ─── SANDBOX: CANVAS CERTIFICATE ──────────────────────────────────────────────
function CanvasMock() {
  const [name, setName] = useState('Alex Developer');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    
    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 600, 400);
    
    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 560, 360);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, 540, 340);

    // Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 300, 100);
    
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px sans-serif';
    ctx.fillText('THIS CERTIFIES THAT', 300, 150);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px serif';
    ctx.fillText(name || 'Participant Name', 300, 220);
    
    // Line
    ctx.beginPath();
    ctx.moveTo(150, 240);
    ctx.lineTo(450, 240);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px sans-serif';
    ctx.fillText('HAS SUCCESSFULLY COMPLETED THE EVENT', 300, 280);

    // Signature
    ctx.font = 'italic 16px serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Platform Admin', 150, 340);
    ctx.beginPath(); ctx.moveTo(80, 350); ctx.lineTo(220, 350); ctx.stroke();

    // Hash
    ctx.textAlign = 'right';
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    const hash = (name.length * 99991).toString(16).padStart(16, '0');
    ctx.fillText(`SHA256: ${hash}`, 550, 360);
  }, [name]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `${name}-certificate.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', alignItems: 'center' }}>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Type Name for Certificate" style={{ width: '100%', maxWidth: '300px', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }} />
      <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={600} height={400} style={{ width: '100%', maxWidth: '400px', height: 'auto', borderRadius: '4px' }} />
      </div>
      <button onClick={handleDownload} style={{ padding: '8px 20px', background: '#ffffff', color: '#000000', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Download Image</button>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function PortalHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  
  const sections = {
    features: useRef(null),
    sandbox: useRef(null),
    pricing: useRef(null),
  };

  const scrollTo = (id) => {
    sections[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sandboxTabs = [
    { title: 'Algorithmic Sponsor Matching', component: SponsorMatcherMock },
    { title: 'Gamified Volunteer Kanban', component: KanbanMock },
    { title: 'Dynamic QR Ticket Scanning', component: QRMock },
    { title: 'Canvas Certificate Generation', component: CanvasMock },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', fontFamily: 'sans-serif' }}>
      <NavBar scrollTo={scrollTo} />

      {/* ─── HERO SECTION ─── */}
      <section style={{ paddingTop: '180px', paddingBottom: '120px', textAlign: 'center', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '32px' }}>
          # THE UNIFIED MULTI-SIDED ECOSYSTEM
        </div>
        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: '800', lineHeight: 1.05, letterSpacing: '-0.04em', maxWidth: '1000px', margin: '0 auto 24px' }}>
          The Operating System for<br/>Modern Hackathons & Workshops.
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', maxWidth: '600px', margin: '0 auto 48px', lineHeight: 1.6 }}>
          A deeply integrated, role-gated ecosystem for organizers, sponsors, volunteers, and participants. Built for extreme scale and performance.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/login/organizer')} style={{ padding: '16px 32px', background: '#ffffff', color: '#000000', borderRadius: '40px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', border: 'none', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            Host Your First Event
          </button>
          <button onClick={() => navigate('/login')} style={{ padding: '16px 32px', background: 'transparent', color: '#ffffff', borderRadius: '40px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Explore Active Events
          </button>
        </div>
      </section>

      {/* ─── LIVE INTERACTIVE SANDBOX ─── */}
      <section ref={sections.sandbox} style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '16px' }}>Experience the Engine</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '500px', margin: '0 auto' }}>Interact with our core platform algorithms natively in your browser before you even sign in.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'stretch' }}>
          {/* Left: Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sandboxTabs.map((tab, i) => {
              const active = activeTab === i;
              return (
                <button key={i} onClick={() => setActiveTab(i)} style={{ padding: '24px', textAlign: 'left', background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)', border: active ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', color: active ? '#ffffff' : 'rgba(255,255,255,0.4)', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                  {active && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#ffffff' }} />}
                  {tab.title}
                </button>
              );
            })}
          </div>
          {/* Right: Sandbox Canvas */}
          <div style={{ ...glass, padding: '40px', minHeight: '350px' }}>
            {React.createElement(sandboxTabs[activeTab].component)}
          </div>
        </div>
      </section>

      {/* ─── BENTO GRID (FEATURES) ─── */}
      <section ref={sections.features} style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '16px' }}>The Four Pillars</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '500px', margin: '0 auto' }}>Dedicated workspaces tailored specifically for every stakeholder in the event ecosystem.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Card A: Organizer */}
          <div style={{ ...glass, padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Organizer Cockpit</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', flex: 1 }}>Real-time analytics, Kanban delegation, and budget tracking.</p>
            <div style={{ height: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{v:10},{v:40},{v:25},{v:60},{v:45},{v:80}]}>
                  <Area type="monotone" dataKey="v" stroke="#ffffff" fill="rgba(255,255,255,0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <Link to="/login/organizer" style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '600', textDecoration: 'none', marginTop: '10px' }}>Access Portal →</Link>
          </div>

          {/* Card B: Sponsor */}
          <div style={{ ...glass, padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Sponsor Marketplace</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', flex: 1 }}>Evaluate AI-matched events and submit corporate capital proposals.</p>
            <div style={{ height: '120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[95, 88].map(score => (
                <div key={score} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#ffffff' }}>Tech Hackathon 2026</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ffffff', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{score}% MATCH</span>
                </div>
              ))}
            </div>
            <Link to="/login/sponsor" style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '600', textDecoration: 'none', marginTop: '10px' }}>Access Portal →</Link>
          </div>

          {/* Card C: Volunteer */}
          <div style={{ ...glass, padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Volunteer Hub</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', flex: 1 }}>Claim tasks, earn operation points, and climb the global leaderboard.</p>
            <div style={{ height: '120px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800' }}>92%</div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Global Rating</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Active Crews</div>
                <div style={{ fontSize: '1rem', color: '#ffffff', fontWeight: '700' }}>3 Deployments</div>
              </div>
            </div>
            <Link to="/login/volunteer" style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '600', textDecoration: 'none', marginTop: '10px' }}>Access Portal →</Link>
          </div>

          {/* Card D: Participant */}
          <div style={{ ...glass, padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Participant Panel</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', flex: 1 }}>Register, manage QR entry passes, and verify Canvas certificates.</p>
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <ScanLine size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
              <ShieldCheck size={48} style={{ color: 'rgba(255,255,255,0.8)' }} />
            </div>
            <Link to="/login/participant" style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '600', textDecoration: 'none', marginTop: '10px' }}>Access Portal →</Link>
          </div>
        </div>
      </section>

      {/* ─── PRICING TIERS ─── */}
      <section ref={sections.pricing} style={{ padding: '80px 24px 120px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '16px' }}>Monochrome Pricing</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '500px', margin: '0 auto' }}>Simple, transparent tiers tailored for events of all scales.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Starter */}
          <div style={{ padding: '40px', background: 'rgba(255,255,255,0.01)', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Starter</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', marginBottom: '24px' }}>Student Clubs & Workshops</p>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '32px' }}>Free</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14}/> Basic Registrations</li>
              <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14}/> 1 Organizer Seat</li>
              <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14}/> Standard Certificates</li>
            </ul>
            <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '14px', marginTop: '32px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>Get Started</button>
          </div>

          {/* Pro */}
          <div style={{ padding: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid #ffffff', borderRadius: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#ffffff', color: '#000000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Most Popular</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Pro</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', marginBottom: '24px' }}>Inter-College Festivals & Hackathons</p>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '32px' }}>$149<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>/event</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14}/> Advanced Sponsor Matching</li>
              <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14}/> Gamified Kanban Delegation</li>
              <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14}/> Custom QR Ticketing</li>
            </ul>
            <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '14px', marginTop: '32px', background: '#ffffff', border: 'none', color: '#000000', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>Upgrade to Pro</button>
          </div>

          {/* Enterprise */}
          <div style={{ padding: '40px', background: 'rgba(255,255,255,0.01)', border: '3px solid #ffffff', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Enterprise</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', marginBottom: '24px' }}>Global Conferences & Orgs</p>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '32px' }}>Custom</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14}/> Multi-tenant Servers</li>
              <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14}/> Custom Domain Mapping</li>
              <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14}/> Advanced Analytics Ledgers</li>
            </ul>
            <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '14px', marginTop: '32px', background: 'transparent', border: '1px solid #ffffff', color: '#ffffff', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
        EVENT MANAGEMENT PLATFORM © 2026. ALL SYSTEMS OPERATIONAL.
      </footer>
    </div>
  );
}
