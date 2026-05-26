import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Briefcase, DollarSign, Users, ChevronRight, Check } from 'lucide-react';

export default function SponsorMatcher() {
  const { getMatchedEvents, applyForSponsorship, user } = useApp();
  const [matchedEvents, setMatchedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [proposalMsg, setProposalMsg] = useState('');
  const [customBid, setCustomBid] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await getMatchedEvents();
      setMatchedEvents(data || []);
      if (data && data.length > 0) {
        setSelectedEvent(data[0]);
        if (data[0].sponsorshipPackages?.length > 0) {
          // Select first unsold package
          const unsold = data[0].sponsorshipPackages.find(p => !p.sold);
          setSelectedPackage(unsold || data[0].sponsorshipPackages[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
    setProposalMsg('');
    setCustomBid('');
    if (evt.sponsorshipPackages?.length > 0) {
      const unsold = evt.sponsorshipPackages.find(p => !p.sold);
      setSelectedPackage(unsold || evt.sponsorshipPackages[0]);
    } else {
      setSelectedPackage(null);
    }
  };

  const handleSendProposal = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !selectedPackage) return;
    
    const bidAmount = customBid ? Number(customBid) : selectedPackage.price;
    setLoading(true);
    try {
      await applyForSponsorship(
        selectedEvent._id,
        selectedPackage._id,
        proposalMsg,
        bidAmount
      );
      setProposalMsg('');
      setCustomBid('');
      // Refresh
      fetchMatches();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', minHeight: '500px' }}>
      {/* Sidebar - Matching Events list */}
      <div className="glass-panel" style={{ padding: '20px', maxHeight: '600px', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={20} /> Matched Campaigns
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '20px' }}>
          Real-time smart match analysis based on your target budget of <strong>${user?.profile?.budget || 0}</strong> and <strong>{user?.profile?.industry || 'industry'}</strong> industry focus.
        </p>

        {loading && matchedEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>Calculating compatibilities...</div>
        ) : matchedEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>No events found to match.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {matchedEvents.map(evt => {
              const isSelected = selectedEvent && selectedEvent._id === evt._id;
              return (
                <div
                  key={evt._id}
                  onClick={() => handleSelectEvent(evt)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)',
                    border: isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em' }}>
                      {evt.type}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: evt.matchScore >= 80 ? '#ffffff' : '#b2b2b2',
                      background: 'rgba(255,255,255,0.07)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {evt.matchScore}% Match
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', margin: '4px 0', color: '#ffffff' }}>{evt.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{evt.date}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Panel - Match Details and Proposer */}
      {selectedEvent ? (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{selectedEvent.title}</h2>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{selectedEvent.matchScore}% Compatibility</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>{selectedEvent.description}</p>
          </div>

          {/* Compatibility Breakdown */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} /> Compatibility Indicators:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(selectedEvent.matchingDetails || []).map((reason, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#9ca3af' }}>
                  <Check size={14} style={{ color: '#ffffff' }} />
                  <span>{reason}</span>
                </div>
              ))}
              {(!selectedEvent.matchingDetails || selectedEvent.matchingDetails.length === 0) && (
                <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Good alignment based on budget specifications.</p>
              )}
            </div>
          </div>

          {/* Packages Selector */}
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Sponsorship Tiers</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {(selectedEvent.sponsorshipPackages || []).map(pkg => {
                const isSelected = selectedPackage && selectedPackage._id === pkg._id;
                return (
                  <div
                    key={pkg._id}
                    onClick={() => !pkg.sold && setSelectedPackage(pkg)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.05)',
                      cursor: pkg.sold ? 'not-allowed' : 'pointer',
                      opacity: pkg.sold ? 0.4 : 1,
                      position: 'relative'
                    }}
                  >
                    {pkg.sold && (
                      <span style={{
                        position: 'absolute', top: '4px', right: '4px', fontSize: '0.65rem',
                        background: 'rgba(255,255,255,0.1)', color: '#ffffff', padding: '1px 4px', borderRadius: '4px'
                      }}>
                        SOLD
                      </span>
                    )}
                    <h5 style={{ fontSize: '0.85rem', color: '#ffffff' }}>{pkg.name}</h5>
                    <p style={{ fontSize: '1rem', fontWeight: 'bold', margin: '4px 0', color: '#ffffff' }}>${pkg.price}</p>
                    <ul style={{ paddingLeft: '12px', fontSize: '0.7rem', color: '#9ca3af' }}>
                      {(pkg.benefits || []).slice(0, 2).map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Send Proposal Form */}
          {selectedPackage ? (
            <form onSubmit={handleSendProposal} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Sponsorship Package</label>
                  <input className="input-glass" type="text" value={selectedPackage.name} disabled style={{ opacity: 0.8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Custom Bid Amount ($) - Optional</label>
                  <input
                    className="input-glass"
                    type="number"
                    placeholder={`Default: $${selectedPackage.price}`}
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Proposal Note</label>
                <textarea
                  className="input-glass"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Introduce your company and specify brand placement expectations..."
                  value={proposalMsg}
                  onChange={(e) => setProposalMsg(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-solid" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
                Submit Sponsorship Bid (${customBid ? customBid : selectedPackage.price})
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              All sponsorship packages have been acquired for this campaign.
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          Select an event from the matches feed to inspect sponsor parameters.
        </div>
      )}
    </div>
  );
}
