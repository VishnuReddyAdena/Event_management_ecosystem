import React, { useRef } from 'react';
import { Award, ShieldCheck, Printer, ArrowLeft, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CertificateGenerator({ certificate, onBack }) {
  const { isOfflineMode, showToast } = useApp();
  const printRef = useRef();

  if (!certificate) return null;

  const handlePrint = () => {
    // Open a print dialog targeting the certificate area
    window.print();
  };

  const handleDownloadOfflineWarning = (e) => {
    if (isOfflineMode) {
      e.preventDefault();
      showToast('Backend server is offline. Real-time PDF compilation is disabled in local demo mode.', 'warning');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
      {/* Action controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', gap: '12px', flexWrap: 'wrap' }}>
        {onBack && (
          <button onClick={onBack} className="btn-glass" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn-glass" style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
            <Printer size={16} /> Print View
          </button>
          <a
            href={isOfflineMode ? '#' : `http://localhost:5000/api/certificates/generate?participantName=${encodeURIComponent(certificate.recipientName)}&eventTitle=${encodeURIComponent(certificate.eventName)}`}
            onClick={handleDownloadOfflineWarning}
            className="btn-solid"
            style={{ fontSize: '0.85rem', padding: '6px 16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} /> Download Official PDF
          </a>
        </div>
      </div>

      {/* Printable Certificate Frame */}
      <div
        ref={printRef}
        className="certificate-print-area"
        style={{
          width: '100%',
          maxWidth: '800px',
          aspectRatio: '1.414', // A4 Landscape ratio
          background: '#0a0a0c',
          border: '8px double rgba(255, 255, 255, 0.4)',
          borderRadius: '16px',
          padding: '40px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Subtle glass background pattern */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '140%',
          height: '140%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Certificate Border Details */}
        <div style={{
          position: 'absolute',
          top: '15px',
          bottom: '15px',
          left: '15px',
          right: '15px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none'
        }} />

        {/* Top Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, marginTop: '20px' }}>
          <Award size={48} style={{ color: '#ffffff' }} />
          <h1 style={{
            fontSize: '1.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: '300',
            textAlign: 'center',
            color: '#ffffff'
          }}>
            Certificate of Achievement
          </h1>
          <div style={{ width: '80px', height: '2px', background: '#ffffff', margin: '8px auto' }} />
        </div>

        {/* Recipient Details */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 1, margin: '20px 0' }}>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>This is proudly presented to</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '600', letterSpacing: '0.05em', color: '#ffffff', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '4px', textAlign: 'center' }}>
            {certificate.recipientName}
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', maxWidth: '500px' }}>
            for active participation, outstanding effort, and successful graduation from the tech seminar
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: '#ffffff', marginTop: '6px', textAlign: 'center' }}>
            "{certificate.eventName}"
          </h3>
        </div>

        {/* Verification Footer details */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          zIndex: 1,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '20px',
          marginTop: '20px'
        }}>
          {/* Signatures */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.9rem', fontFamily: '"Georgia", serif', fontStyle: 'italic', color: '#ffffff' }}>Sarah Jenkins</span>
            <div style={{ width: '120px', height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
            <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>Event Convener Dean</span>
          </div>

          {/* Verification Badge */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ShieldCheck size={14} style={{ color: '#ffffff' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>
                VERIFIED AUTHENTIC
              </span>
            </div>
            <span style={{ fontSize: '0.6rem', color: '#9ca3af', fontFamily: 'monospace' }}>
              ID: {certificate.code}
            </span>
          </div>
        </div>
      </div>
      
      {/* Styles inject to handle print correctly in black and white */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-print-area, .certificate-print-area * {
            visibility: visible;
          }
          .certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            height: 100vh !important;
            border: 4px double #000000 !important;
            background: #ffffff !important;
            color: #000000 !important;
            aspect-ratio: 1.414 !important;
          }
          .certificate-print-area * {
            color: #000000 !important;
          }
          .certificate-print-area line, .certificate-print-area div {
            border-color: #000000 !important;
            background-color: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
