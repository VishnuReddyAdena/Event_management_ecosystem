// ─── VolunteerPortal.jsx ─────────────────────────────────────────────────
// Volunteer Hub — Monochrome Glassmorphism Design
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  User, Award, Shield, Layout, ListCollapse, Play, CheckCircle,
  LogOut, Layers, ArrowRight, ArrowLeft, X, Clock, Trophy, Hexagon, Zap
} from 'lucide-react';

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

// ─── Circle Progress ─────────────────────────────────────────────────────────
function Ring({ pct, size = 64, sw = 4, label }) {
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(pct / 100, 1) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke="#ffffff" strokeWidth={sw}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '0.75rem', fontWeight: '700', fill: '#ffffff' }}>
          {pct}%
        </text>
      </svg>
      {label && <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTS FOR TABS
// ═════════════════════════════════════════════════════════════════════════════

// ─── TAB: ACHIEVEMENT DESK ───────────────────────────────────────────────────
function AchievementDesk({ user, hiredEvents }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ ...glass, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Global Rating</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>{user?.profile?.performanceScore || 100}</div>
          </div>
          <Ring pct={user?.profile?.performanceScore || 100} size={50} sw={3} />
        </div>
        <div style={{ ...glass, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Total Points</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>{user?.profile?.points || 0}</div>
          </div>
          <Award size={36} style={{ color: 'rgba(255,255,255,0.15)' }} />
        </div>
        <div style={{ ...glass, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Active Crews</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>{hiredEvents.length}</div>
          </div>
          <Layers size={36} style={{ color: 'rgba(255,255,255,0.15)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Badges & Credentials */}
        <div style={{ ...glass, padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>Earned Achievement Badges</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {(user?.profile?.badges || []).length > 0 ? (
              user.profile.badges.map((badge, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.8rem', fontWeight: '600' }}>
                  <Trophy size={14} style={{ color: 'rgba(255,255,255,0.6)' }} /> {badge}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '10px 0' }}>Complete operations tasks to unlock badges and credentials.</div>
            )}
          </div>
        </div>

        {/* Skills Registry */}
        <div style={{ ...glass, padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>Verified Skills Tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(user?.profile?.skills || []).length > 0 ? (
              user.profile.skills.map((skill, i) => (
                <span key={i} style={{ padding: '5px 12px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.25)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                  {skill}
                </span>
              ))
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '10px 0' }}>No skills tags configured. Edit your profile to add skills.</div>
            )}
          </div>
        </div>
      </div>

      {/* Active Events */}
      <div style={{ ...glass, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>Active Event Engagements</div>
        </div>
        <div style={{ padding: hiredEvents.length > 0 ? '0' : '30px 24px', textAlign: hiredEvents.length > 0 ? 'left' : 'center' }}>
          {hiredEvents.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Event Campaign', 'Date', 'Type', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hiredEvents.map((evt, i) => (
                  <tr key={evt._id} style={{ borderBottom: i < hiredEvents.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '14px 24px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>{evt.title}</td>
                    <td style={{ padding: '14px 24px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{evt.date}</td>
                    <td style={{ padding: '14px 24px' }}><span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{evt.type}</span></td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: '700', color: '#000000', background: '#ffffff', padding: '3px 10px', borderRadius: '12px' }}>
                        <CheckCircle size={10} /> ACTIVE CREW
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Not currently hired for any events. Apply for open event slots.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: VOLUNTEER KANBAN ───────────────────────────────────────────────────
function KanbanBoard({ event }) {
  const { tasks, loadTasks, updateTaskStatus, user } = useApp();

  React.useEffect(() => {
    if (event?._id) loadTasks(event._id);
  }, [event, loadTasks]);

  if (!event) return <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px' }}>Select an active hired event to load the operations desk.</div>;

  const eventTasks = tasks.filter(t => (t.eventId?._id || t.eventId || t.event?._id || t.event) === event._id);
  const todo = eventTasks.filter(t => t.status === 'todo');
  const inProgress = eventTasks.filter(t => t.status === 'inProgress');
  const done = eventTasks.filter(t => t.status === 'done');

  const COLS = [
    { id: 'todo', label: 'To Do', items: todo, color: 'rgba(255,255,255,0.45)' },
    { id: 'inProgress', label: 'In Progress', items: inProgress, color: 'rgba(255,255,255,0.75)' },
    { id: 'done', label: 'Completed', items: done, color: '#ffffff' }
  ];

  const handleUpdate = (id, newStatus) => {
    updateTaskStatus(id, newStatus);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', alignItems: 'start' }}>
      {COLS.map(col => (
        <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: col.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col.label}</span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2px 8px', color: 'rgba(255,255,255,0.45)' }}>{col.items.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {col.items.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Empty Column</div>
            ) : (
              col.items.map(task => {
                const assigneeName = task.assignedToUser?.name || 
                                     (task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo.name : null) || 
                                     (event.volunteers?.find(v => String(v._id || v) === String(task.assignedTo))?.name) ||
                                     'Unassigned';
                const isMine = user && String(task.assignedTo) === String(user._id);

                return (
                  <div key={task._id} style={{ padding: '14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '600', marginBottom: '6px', lineHeight: 1.3 }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', lineHeight: 1.4 }}>{task.description}</div>}
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: isMine ? '#ffffff' : 'rgba(255,255,255,0.3)', fontWeight: isMine ? '600' : '400' }}>
                        <User size={10} /> {isMine ? 'Assigned to You' : assigneeName}
                      </div>
                      
                      {isMine && col.id !== 'done' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {col.id === 'todo' && (
                            <button onClick={() => handleUpdate(task._id, 'inProgress')} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#ffffff', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Start <ArrowRight size={10} />
                            </button>
                          )}
                          {col.id === 'inProgress' && (
                            <button onClick={() => handleUpdate(task._id, 'done')} style={{ padding: '4px 10px', background: '#ffffff', border: 'none', borderRadius: '6px', color: '#000000', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={10} /> Finish
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TAB: APPLY ──────────────────────────────────────────────────────────────
function ApplyDesk({ openEvents, user, applications, applyToVolunteer }) {
  const [showForm, setShowForm] = useState(null);
  const [msg, setMsg] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleSkill = s => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async (e, id) => {
    e.preventDefault();
    setLoading(true);
    try {
      await applyToVolunteer(id, msg, skills);
      setShowForm(null); setMsg(''); setSkills([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {openEvents.length === 0 ? (
        <div style={{ ...glass, padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No open event positions at the moment.</div>
      ) : (
        openEvents.map(evt => (
          <div key={evt._id} style={{ ...glass, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{evt.type} · {evt.date}</div>
                <h4 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: '700', margin: '0 0 6px' }}>{evt.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>{evt.description}</p>
              </div>
              {showForm !== evt._id && (
                <button onClick={() => { setShowForm(evt._id); setSkills(user?.profile?.skills || []); }} style={{ padding: '8px 16px', background: '#ffffff', color: '#000000', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Apply for Crew
                </button>
              )}
            </div>

            {showForm === evt._id && (
              <form onSubmit={e => handleSubmit(e, evt._id)} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={lbl}>Cover Pitch</label>
                  <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} placeholder="Briefly state why you want to support this event crew..." value={msg} onChange={e => setMsg(e.target.value)} required />
                </div>
                <div>
                  <label style={lbl}>Highlight Core Skills</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['React', 'JavaScript', 'Design', 'Logistics', 'Hosting', 'Social Media', 'Discord Mod'].map(s => {
                      const sel = skills.includes(s);
                      return (
                        <button key={s} type="button" onClick={() => toggleSkill(s)} style={{ padding: '6px 14px', background: sel ? '#ffffff' : 'transparent', border: sel ? '1px solid #ffffff' : '1px dashed rgba(255,255,255,0.25)', borderRadius: '8px', color: sel ? '#000000' : 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: sel ? '700' : '400', cursor: 'pointer', transition: 'all 0.2s' }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button type="button" onClick={() => setShowForm(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={loading} style={{ padding: '8px 20px', background: '#ffffff', color: '#000000', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Submit Application</button>
                </div>
              </form>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ─── TAB: LEADERBOARD ────────────────────────────────────────────────────────
function LeaderboardDesk({ leaderboard, user }) {
  return (
    <div style={{ ...glass, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', letterSpacing: '0.02em' }}>Global Volunteer Rankings</div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Ranked by operation points and task delivery records.</div>
      </div>
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
              {['Rank', 'Volunteer', 'Badges', 'Score', 'Points'].map(h => (
                <th key={h} style={{ padding: '12px 24px', textAlign: h === 'Score' || h === 'Points' ? 'right' : 'left', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((vol, i) => {
              const isSelf = user && String(vol._id) === String(user._id);
              return (
                <tr key={vol._id} style={{ borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: isSelf ? 'rgba(255,255,255,0.04)' : 'transparent', transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 24px', width: '60px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? '#ffffff' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', color: i === 0 ? '#000000' : 'rgba(255,255,255,0.6)' }}>
                      #{i + 1}
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: '600', color: isSelf ? '#ffffff' : 'rgba(255,255,255,0.85)' }}>
                      {vol.name} {isSelf && <span style={{ fontSize: '0.65rem', color: '#000000', background: '#ffffff', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', verticalAlign: 'middle' }}>YOU</span>}
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(vol.badges || []).slice(0,2).map((b, idx) => (
                        <span key={idx} style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>{b}</span>
                      ))}
                      {(vol.badges || []).length === 0 && <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>{vol.performanceScore}%</td>
                  <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>{vol.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// MAIN — VolunteerPortal
// ═════════════════════════════════════════════════════════════════════════════
export default function VolunteerPortal() {
  const { user, events, applications, leaderboard, logout, applyToVolunteer } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // profile, tasks, apply, leaderboard
  const [selectedEventId, setSelectedEventId] = useState('');

  const hiredEvents = events.filter(evt => (evt.volunteers || []).some(v => String(v._id || v) === String(user?._id)));
  
  const openEvents = events.filter(evt => {
    const isHired = (evt.volunteers || []).some(v => String(v._id || v) === String(user?._id));
    const hasApplied = applications.some(app => String(app.event?._id || app.event) === String(evt._id) && String(app.user?._id || app.user) === String(user?._id));
    return !isHired && !hasApplied;
  });

  // Default event selection for Kanban
  React.useEffect(() => {
    if (hiredEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(hiredEvents[0]._id);
    }
  }, [hiredEvents, selectedEventId]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, paddingBottom: '60px' }}>
      
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 200 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ padding: '7px', background: '#ffffff', borderRadius: '9px', display: 'flex' }}><Layers size={18} style={{ color: '#000000' }} /></div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em' }}>EVENT MANAGEMENT</div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>VOLUNTEER HUB</div>
          </div>
        </Link>

        {/* Hero Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          {[
            { id: 'profile', label: 'Achievement Desk', sub: 'Badges & Stats', icon: Award },
            { id: 'tasks', label: 'Tasks Board', sub: 'Kanban Operations', icon: Layout },
            { id: 'apply', label: 'Open Crews', sub: 'Apply for events', icon: ListCollapse },
            { id: 'leaderboard', label: 'Leaderboard', sub: 'Global Rankings', icon: Shield }
          ].map(t => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRadius: '14px',
                  border: active ? '1px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.08)',
                  background: active ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                  color: '#ffffff', cursor: 'pointer', transition: 'all 0.25s ease', textAlign: 'left',
                  boxShadow: active ? '0 4px 20px rgba(255,255,255,0.05)' : 'none'
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; } }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: active ? '#ffffff' : 'rgba(255,255,255,0.03)', border: active ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease' }}>
                  <Icon size={14} style={{ color: active ? '#000000' : 'rgba(255,255,255,0.6)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: active ? '#ffffff' : 'rgba(255,255,255,0.85)', lineHeight: 1.1 }}>{t.label}</div>
                  <div style={{ fontSize: '0.62rem', color: active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.3)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{t.sub}</div>
                </div>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} style={{ color: '#ffffff' }} /></div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#ffffff' }}>{user?.name}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Volunteer</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          ><LogOut size={14} /> Sign Out</button>
        </div>
      </header>

      {/* ── Main Workspace ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1000px', margin: '40px auto 0', padding: '0 32px' }}>
        
        {/* Profile Details Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>
            {user?.name?.charAt(0) || 'V'}
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>{user?.name}</h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Student Volunteer</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{hiredEvents.length} Active Deployments</span>
            </div>
          </div>
        </div>

        {/* Content Render */}
        {activeTab === 'profile' && <AchievementDesk user={user} hiredEvents={hiredEvents} />}
        
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ ...glass, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>Operations Desk</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Select an event campaign to view and manage tasks.</div>
              </div>
              <div style={{ width: '300px' }}>
                <select style={{ ...inp, background: '#0a0a0c', cursor: 'pointer' }} value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                  {hiredEvents.length === 0 && <option value="">No Active Event Desks</option>}
                  {hiredEvents.map(evt => <option key={evt._id} value={evt._id}>{evt.title}</option>)}
                </select>
              </div>
            </div>
            
            {selectedEventId ? (
              <KanbanBoard event={events.find(e => e._id === selectedEventId)} />
            ) : (
              <div style={{ ...glass, padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                Join an event crew first to load operations tasks.
              </div>
            )}
          </div>
        )}

        {activeTab === 'apply' && <ApplyDesk openEvents={openEvents} user={user} applications={applications} applyToVolunteer={applyToVolunteer} />}
        
        {activeTab === 'leaderboard' && <LeaderboardDesk leaderboard={leaderboard} user={user} />}

      </div>
    </div>
  );
}
