import { dataHelper } from '../models/dataHelper.js';

export const issueCertificate = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({ message: 'Event ID and User ID are required.' });
    }

    const event = await dataHelper.findById('Event', eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Verify organizer permission
    if (String(event.organizer) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized. Only organizers can issue certificates.' });
    }

    const user = await dataHelper.findById('User', userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if certificate already issued
    const existingCert = await dataHelper.findOne('Certificate', { event: eventId, user: userId });
    if (existingCert) {
      return res.status(400).json({ message: 'Certificate has already been issued to this participant for this event.', certificate: existingCert });
    }

    // Generate unique verification code
    const uniqueHash = Math.random().toString(36).substring(2, 8).toUpperCase() + 
                     Math.random().toString(36).substring(2, 8).toUpperCase();
    const certificateCode = `CERT-${event.type.substring(0,3).toUpperCase()}-${uniqueHash}`;

    const newCertificate = await dataHelper.create('Certificate', {
      event: eventId,
      user: userId,
      code: certificateCode,
      recipientName: user.name,
      eventName: event.title
    });

    res.status(201).json(newCertificate);
  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({ message: 'Server error during certificate generation.' });
  }
};

export const getCertificates = async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'participant' || req.user.role === 'volunteer') {
      query.userId = req.user.id;
    } else if (req.query.userId) {
      query.userId = req.query.userId;
    }

    if (req.query.eventId) {
      query.eventId = req.query.eventId;
    }

    const certificates = await dataHelper.find('Certificate', query);
    res.status(200).json(certificates);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Server error retrieving certificates.' });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: 'Certificate verification code is required.' });
    }

    const certificate = await dataHelper.findOne('Certificate', { code: code.toUpperCase() });
    if (!certificate) {
      return res.status(404).json({ verified: false, message: 'Certificate not found. Verification failed.' });
    }

    res.status(200).json({
      verified: true,
      message: 'Certificate verified successfully.',
      certificate: {
        code: certificate.code,
        recipientName: certificate.recipientName,
        eventName: certificate.eventName,
        issuedAt: certificate.issuedAt
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Server error during certificate verification.' });
  }
};

import PDFDocument from 'pdfkit';
import crypto from 'crypto';

export const generatePdfCertificate = async (req, res) => {
  try {
    const { participantName, eventTitle } = req.query;

    if (!participantName || !eventTitle) {
      return res.status(400).json({ error: 'Missing certificate rendering fields.' });
    }

    // Set response headers to trigger inline PDF streaming
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${participantName.replace(/\s+/g, '_')}.pdf`);

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    });

    doc.pipe(res);

    const pageWidth = 841.89; // Landscape A4 standard width
    const pageHeight = 595.28;

    // Render solid black canvas background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#000000');

    // Render geometric borders
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(2).stroke('#FFFFFF');
    doc.rect(28, 28, pageWidth - 56, pageHeight - 56).lineWidth(0.5).stroke('rgba(255, 255, 255, 0.3)');

    // Render Branding Label
    doc.fillColor('rgba(255, 255, 255, 0.6)').fontSize(10).font('Helvetica').text('PLATFORM VERIFIED PARTICIPATION RECORD', 0, 75, {
      align: 'center',
      width: pageWidth
    });

    // Render separation line
    doc.moveTo(pageWidth / 2 - 40, 100).lineTo(pageWidth / 2 + 40, 100).lineWidth(1).stroke('rgba(255, 255, 255, 0.5)');

    // Main Typography Header
    doc.fillColor('#FFFFFF').fontSize(36).font('Helvetica-Bold').text('CERTIFICATE OF ACCOMPLISHMENT', 0, 150, {
      align: 'center',
      width: pageWidth
    });

    doc.fillColor('rgba(255, 255, 255, 0.6)').fontSize(14).font('Helvetica-Oblique').text('Conferred to', 0, 230, {
      align: 'center',
      width: pageWidth
    });

    doc.fillColor('#FFFFFF').fontSize(30).font('Helvetica-Bold').text(participantName, 0, 270, {
      align: 'center',
      width: pageWidth
    });

    doc.fillColor('rgba(255, 255, 255, 0.6)').fontSize(14).font('Helvetica').text(`for successfully completing the core curriculum at`, 0, 330, {
      align: 'center',
      width: pageWidth
    });

    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text(`"${eventTitle.toUpperCase()}"`, 0, 365, {
      align: 'center',
      width: pageWidth
    });

    // Calculate unique validation hash
    const verificationHash = crypto
      .createHash('sha256')
      .update(`${participantName}-${eventTitle}`)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase();

    // Draw signature fields
    doc.moveTo(150, 480).lineTo(300, 480).lineWidth(1).stroke('rgba(255, 255, 255, 0.5)');
    doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('ORGANIZING CHAIR', 150, 490, { align: 'center', width: 150 });

    doc.moveTo(pageWidth - 300, 480).lineTo(pageWidth - 150, 480).lineWidth(1).stroke('rgba(255, 255, 255, 0.5)');
    doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('TECHNICAL DIRECTOR', pageWidth - 300, 490, { align: 'center', width: 150 });

    // Verification Hash Footer
    doc.fillColor('rgba(255, 255, 255, 0.4)').fontSize(8).font('Courier').text(`SECURITY HASH: ${verificationHash}`, 0, 530, {
      align: 'center',
      width: pageWidth
    });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Server error during PDF streaming.' });
  }
};
