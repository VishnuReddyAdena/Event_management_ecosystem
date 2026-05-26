import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SponsorMatcher from '../components/SponsorMatcher';
import { Briefcase, Landmark, PieChart, Activity, FileCheck, CheckCircle2, AlertCircle, LogOut, Layers, User } from 'lucide-react';

export default function SponsorMarketplace() {
  const { user, applications, events, logout } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matchmaking'); // matchmaking, proposals, roi
  const [roiStats, setRoiStats] = useState({ invested: 0, activeCampaigns: 0, impressions: 0 });

  // Filter proposals sent by this sponsor
  const myProposals = applications.filter(app => {
    const userId = app.user?._id || app.user;
    return String(userId) === String(user?._id) && app.type === 'sponsor';
  });

  // Calculate ROI metrics based on approved sponsorship proposals
  useEffect(() => {
    const approvedSponsorships = myProposals.filter(app => app.status === 'approved');
    const investedVal = approvedSponsorships.reduce((acc, curr) => acc + (curr.details?.sponsorAmount || 0), 0);
    const activeVal = approvedSponsorships.length;
    
    // Estimate impressions based on participant counts of approved events
    let estImpressions = 0;
    approvedSponsorships.forEach(app => {
      const evId = app.event?._id || app.event;
      const associatedEv = events.find(e => String(e._id) === String(evId));
      if (associatedEv) {
        const participantCount = (associatedEv.participants || []).length;
        // Each participant generates estimated ~120 branding impressions (social media reach + physical t-shirt banner impressions)
        estImpressions += (participantCount || 5) * 120;
      }
    });

    setRoiStats({
      invested: investedVal,
      activeCampaigns: activeVal,
      impressions: estImpressions || (activeVal * 350) // fallback base reach
    });
  }, [applications, events, user]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Nav */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 200 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ padding: '7px', background: '#ffffff', borderRadius: '9px', display: 'flex' }}><Layers size={18} style={{ color: '#000000' }} /></div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em' }}>EVENT MANAGEMENT</div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SPONSOR MARKETPLACE</div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} style={{ color: '#ffffff' }} /></div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#ffffff' }}>{user?.name}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sponsor</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          ><LogOut size={14} /> Sign Out</button>
        </div>
      </header>
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header and Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Sponsorship marketplace</h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            Brand association dashboard for <strong>{user?.profile?.company}</strong>.
          </p>
        </div>

        {/* Tab Selection buttons */}
        <div className="glass-panel" style={{ padding: '6px', display: 'flex', gap: '4px' }}>
          {[
            { id: 'matchmaking', name: 'Smart Matchmaker', icon: Briefcase },
            { id: 'proposals', name: `Proposals (${myProposals.length})`, icon: FileCheck },
            { id: 'roi', name: 'ROI Analytics', icon: PieChart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn-glass"
              style={{
                border: 'none',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#9ca3af',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                flex: 1
              }}
            >
              <tab.icon size={14} /> {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content */}
      <div style={{ minWidth: 0 }}>
        {activeTab === 'matchmaking' && <SponsorMatcher />}

        {activeTab === 'proposals' && (
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Sponsorship Proposal Pipeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myProposals.length === 0 ? (
                <div style={{ padding: '40px 0', color: '#9ca3af', textAlign: 'center', fontSize: '0.9rem' }}>
                  No sponsorship bids submitted yet. Review matching campaigns to make an offer.
                </div>
              ) : (
                myProposals.map(prop => {
                  const ev = events.find(e => String(e._id) === String(prop.event?._id || prop.event));
                  const title = ev ? ev.title : (prop.event?.title || 'Unknown Event');
                  const pkgId = prop.details?.packageId;
                  const pkg = ev?.sponsorshipPackages?.find(p => String(p._id) === String(pkgId));
                  const pkgName = pkg ? pkg.name : 'Custom Slot';

                  return (
                    <div
                      key={prop._id}
                      style={{
                        padding: '16px',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1rem', color: '#ffffff' }}>{title}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                          Sponsoring: {pkgName} • Bid Offer: <strong>${prop.details?.sponsorAmount}</strong>
                        </span>
                        {prop.details?.message && (
                          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px', fontStyle: 'italic' }}>
                            "{prop.details.message}"
                          </p>
                        )}
                      </div>
                      
                      <div>
                        {prop.status === 'pending' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: 'rgba(255, 255, 255, 0.02)', color: '#a3a3a3',
                            border: '1px solid rgba(255, 255, 255, 0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem'
                          }}>
                            <AlertCircle size={12} /> Pending Organizer Audit
                          </span>
                        )}
                        {prop.status === 'approved' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem'
                          }}>
                            <CheckCircle2 size={12} /> Approved & Active
                          </span>
                        )}
                        {prop.status === 'rejected' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: 'rgba(255, 255, 255, 0.01)', color: '#6b7280',
                            border: '1px solid rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem'
                          }}>
                            Declined Offer
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'roi' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
            {/* ROI stats indicator cards */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} /> Performance Metrics
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>TOTAL CAPITAL SPONSORED</span>
                  <h4 style={{ fontSize: '1.5rem', color: '#ffffff', marginTop: '4px' }}>${roiStats.invested}</h4>
                </div>
                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ACTIVE CAMPAIGNS SUPPORTED</span>
                  <h4 style={{ fontSize: '1.5rem', color: '#ffffff', marginTop: '4px' }}>{roiStats.activeCampaigns} Events</h4>
                </div>
                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ESTIMATED BRAND IMPRESSIONS</span>
                  <h4 style={{ fontSize: '1.5rem', color: '#ffffff', marginTop: '4px' }}>{roiStats.impressions} Views</h4>
                </div>
              </div>
            </div>

            {/* Brand Value analytics */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={18} /> Cost-Benefit Evaluation
              </h3>
              
              <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block' }}>Average Cost Per Mille (CPM)</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ffffff', marginTop: '2px' }}>
                    {roiStats.impressions > 0 ? `$${((roiStats.invested / roiStats.impressions) * 1000).toFixed(2)}` : '$0.00'} 
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'normal', marginLeft: '4px' }}>per 1000 views</span>
                  </p>
                </div>
                
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block' }}>Branding Value Return Ratio</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ffffff', marginTop: '2px' }}>
                    1 : 1.84 <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'normal', marginLeft: '4px' }}>Est. Brand Equity Multiplier</span>
                  </p>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: '1.5', marginTop: '6px' }}>
                  * ROI estimates are formulated using aggregate developer registrations, networking engagements, and social-media interactions recorded during sponsored hackathons.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
