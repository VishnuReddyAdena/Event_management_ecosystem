import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import QRCodeModal from '../components/QRCodeModal';
import CertificateGenerator from '../components/CertificateGenerator';
import { Calendar, Ticket, Award, MessageSquare, ExternalLink } from 'lucide-react';

export default function ParticipantPortal() {
  const { user, events, registerForEvent, certificates, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('events'); // events, tickets, certificates, feedback
  
  // Modals & Sub-page views
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  
  // Feedback form state
  const [feedbackEvt, setFeedbackEvt] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackEvt || !review) return;

    showToast('Thank you! Feedback submitted to organizers.');
    setFeedbackEvt('');
    setRating(5);
    setReview('');
  };

  // Find events where participant is registered
  const myEvents = events.filter(evt =>
    (evt.participants || []).some(part => String(part._id || part) === String(user?._id))
  );

  // Find events where participant is NOT registered
  const openEvents = events.filter(evt =>
    !(evt.participants || []).some(part => String(part._id || part) === String(user?._id))
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', minHeight: '80vh' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Participant Portal</h3>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Manage tickets, view credentials, and network.</p>
        </div>

        <div className="glass-panel" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'events', name: 'Explore Campaigns', icon: Calendar },
            { id: 'tickets', name: `My Tickets (${myEvents.length})`, icon: Ticket },
            { id: 'certificates', name: 'My Certificates', icon: Award },
            { id: 'feedback', name: 'Feedback Hub', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setViewingCertificate(null); }}
              className="btn-glass"
              style={{
                border: 'none',
                justifyContent: 'flex-start',
                background: activeTab === tab.id && !viewingCertificate ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: activeTab === tab.id && !viewingCertificate ? '#ffffff' : '#9ca3af',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}
            >
              <tab.icon size={16} /> {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content */}
      <div style={{ minWidth: 0 }}>
        {viewingCertificate ? (
          /* Show certificate full printable view */
          <CertificateGenerator
            certificate={viewingCertificate}
            onBack={() => setViewingCertificate(null)}
          />
        ) : (
          /* Tab contents */
          <div>
            {activeTab === 'events' && (
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Explore Open Tech Campaigns</h2>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Register for hackathons, workshops, and college seminars.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {openEvents.map(evt => (
                    <div
                      key={evt._id}
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
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af' }}>{evt.type}</span>
                        <h4 style={{ fontSize: '1.15rem', color: '#ffffff', margin: '4px 0' }}>{evt.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{evt.description}</p>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#ffffff', marginTop: '6px' }}>
                          📅 {evt.date} at {evt.time} | Venue: {evt.venue}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => registerForEvent(evt._id)}
                        className="btn-solid"
                        style={{ padding: '8px 16px', fontSize: '0.85rem', flexShrink: 0 }}
                      >
                        Get Ticket Pass
                      </button>
                    </div>
                  ))}
                  {openEvents.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: '0.9rem' }}>
                      You are registered for all currently published campaigns!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>My Active Ticket Passes</h2>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Click any card to display the entry validation QR code.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {myEvents.map(evt => (
                    <div
                      key={evt._id}
                      onClick={() => setSelectedTicket({
                        code: `TKT-${evt.type.substring(0,3).toUpperCase()}-${String(evt._id).substr(-6).toUpperCase()}`,
                        holderName: user?.name,
                        eventTitle: evt.title,
                        eventDate: evt.date,
                        eventTime: evt.time,
                        eventVenue: evt.venue
                      })}
                      className="glass-panel"
                      style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.015)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        minHeight: '160px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af' }}>{evt.type}</span>
                        <h4 style={{ fontSize: '1.1rem', margin: '4px 0', color: '#ffffff' }}>{evt.title}</h4>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'block' }}>SCHEDULE</span>
                          <span style={{ fontSize: '0.8rem', color: '#ffffff' }}>{evt.date}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          View Pass <ExternalLink size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                  {myEvents.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: '0.9rem' }}>
                      No ticket passes reserved yet. Check out "Explore Campaigns" to register.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>My Graduation Awards</h2>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Credentials issued by event conveners. Click to view full A4 printable certificate.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {certificates.map(cert => (
                    <div
                      key={cert._id}
                      onClick={() => setViewingCertificate(cert)}
                      className="glass-panel"
                      style={{
                        padding: '14px 20px',
                        background: 'rgba(255,255,255,0.015)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1rem', color: '#ffffff' }}>{cert.eventName}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Open Certificate <ExternalLink size={12} />
                      </span>
                    </div>
                  ))}
                  {certificates.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: '0.9rem' }}>
                      No credentials issued to your profile yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Campaign Feedback Hub</h2>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Share reviews and report operational feedback to help conveners optimize future seminars.</p>
                </div>

                <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Select Event Campaign</label>
                    <select
                      className="input-glass"
                      value={feedbackEvt}
                      onChange={(e) => setFeedbackEvt(e.target.value)}
                      required
                      style={{ background: 'rgba(10, 10, 12, 0.8)', color: '#ffffff' }}
                    >
                      <option value="">Choose registered event...</option>
                      {myEvents.map(evt => (
                        <option key={evt._id} value={evt._id}>{evt.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Rating Index</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: rating >= star ? '#ffffff' : 'rgba(255,255,255,0.15)',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Review Message</label>
                    <textarea
                      className="input-glass"
                      placeholder="Comment on scheduling, food, network switch speeds, and speaker guidelines..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      required
                      style={{ minHeight: '100px' }}
                    />
                  </div>

                  <button type="submit" className="btn-solid" style={{ alignSelf: 'flex-end', padding: '10px 24px' }}>
                    Publish Feedback
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* QR Code Ticketing Modal */}
        <QRCodeModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          ticketData={selectedTicket}
        />
      </div>
    </div>
  );
}
