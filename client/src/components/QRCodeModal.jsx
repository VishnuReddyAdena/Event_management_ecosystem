import React from 'react';
import { QrCode, X, Calendar, MapPin, User, Ticket } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, ticketData }) {
  if (!isOpen || !ticketData) return null;

  // Let's generate a pseudo-random 21x21 QR matrix based on a hash of the ticket code
  // This is a pure-SVG rendering that models a real QR code with three corner alignment indicators.
  const codeHash = ticketData.code || 'MOCKTICKET';
  
  const generateQRMatrix = (seed) => {
    const size = 21;
    const matrix = Array(size).fill(0).map(() => Array(size).fill(0));
    
    // Add three finder patterns (7x7 blocks at top-left, top-right, bottom-left)
    const addFinderPattern = (rowOffset, colOffset) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if (isBorder || isCenter) {
            matrix[rowOffset + r][colOffset + c] = 1;
          }
        }
      }
    };
    
    addFinderPattern(0, 0);
    addFinderPattern(0, 14);
    addFinderPattern(14, 0);

    // Seeded random number generator
    let hashVal = 0;
    for (let i = 0; i < seed.length; i++) {
      hashVal = seed.charCodeAt(i) + ((hashVal << 5) - hashVal);
    }

    // Fill remaining spots randomly
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finder pattern zones
        const isTL = r < 8 && c < 8;
        const isTR = r < 8 && c >= 13;
        const isBL = r >= 13 && c < 8;
        if (isTL || isTR || isBL) continue;
        
        // Pseudo-random bit
        const bit = ((hashVal >> (r + c)) & 1) ^ (r % 2 === 0 ? 1 : 0);
        matrix[r][c] = bit;
      }
    }
    
    return matrix;
  };

  const matrix = generateQRMatrix(codeHash);
  const size = 21;
  const blockSize = 8;
  const svgSize = size * blockSize;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(10, 10, 12, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Ticket Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', marginBottom: '8px' }}>
            <Ticket size={24} style={{ color: '#ffffff' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Official Entry Ticket</h3>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ticket ID: {codeHash}
          </span>
        </div>

        {/* Custom SVG QR Code Matrix */}
        <div style={{
          padding: '16px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
            {matrix.map((row, r) => 
              row.map((val, c) => {
                if (val === 0) return null;
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={c * blockSize}
                    y={r * blockSize}
                    width={blockSize}
                    height={blockSize}
                    fill="#0a0a0c"
                  />
                );
              })
            )}
          </svg>
        </div>

        {/* Event details card */}
        <div style={{
          width: '100%',
          borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={16} style={{ color: '#9ca3af' }} />
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#9ca3af' }}>HOLDER</span>
              <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '500' }}>{ticketData.holderName}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={16} style={{ color: '#9ca3af' }} />
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#9ca3af' }}>EVENT & SCHEDULE</span>
              <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '500' }}>{ticketData.eventTitle}</span>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af' }}>{ticketData.eventDate} at {ticketData.eventTime}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={16} style={{ color: '#9ca3af' }} />
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#9ca3af' }}>VENUE</span>
              <span style={{ fontSize: '0.85rem', color: '#ffffff' }}>{ticketData.eventVenue}</span>
            </div>
          </div>
        </div>

        {/* Print instructions */}
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>
          Please present this QR code at the registration desk for verification scan on arrival.
        </p>
      </div>
    </div>
  );
}
