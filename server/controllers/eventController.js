import crypto from 'crypto';
import QRCode from 'qrcode';
import { dataHelper } from '../models/dataHelper.js';

// Helper to get default organization tenant
const getOrCreateDefaultTenant = async () => {
  let tenant = await dataHelper.findOne('Organization', { slug: 'tech_university' });
  if (!tenant) {
    tenant = await dataHelper.create('Organization', {
      name: 'Tech University Tenant',
      slug: 'tech_university',
      tier: 'Standard'
    });
  }
  return tenant;
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, type, sponsorshipPackages, volunteersNeeded, budget } = req.body;
    
    if (!title || !description || !date || !time || !venue || !type) {
      return res.status(400).json({ message: 'Title, description, date, time, venue, and type are required fields.' });
    }
    
    const tenant = await getOrCreateDefaultTenant();
    const tenantId = req.user?.tenantId || tenant._id;

    const formattedPackages = (sponsorshipPackages || []).map(pkg => ({
      name: pkg.name,
      price: Number(pkg.price),
      benefits: pkg.benefits || [],
      sold: false,
      sponsor: null
    }));

    const initialBudget = {
      income: Number(budget?.income) || 0,
      expenses: Number(budget?.expenses) || 0,
      items: budget?.items || []
    };

    const newEvent = await dataHelper.create('Event', {
      organizationId: tenantId,
      title,
      description,
      date,
      time,
      venue,
      format: ['hackathon', 'workshop', 'college'].includes(type) ? type : 'hackathon',
      status: 'Active',
      targetTechStack: ['React', 'Node.js', 'Express', 'MongoDB'],
      eventDomains: ['Web Development', 'Sustainability'],
      estimatedAttendees: 150,
      volunteersNeeded: Number(volunteersNeeded) || 5,
      volunteers: [],
      participants: [],
      budget: initialBudget
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error during event creation.' });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await dataHelper.find('Event');
    
    // Enrich with organizer and volunteer names for JSON fallback compatibility
    const users = await dataHelper.find('User');
    const enrichedEvents = events.map(evt => {
      const org = users.find(u => String(u._id) === String(evt.organizer || evt.organizationId));
      const vols = (evt.volunteers || []).map(vId => {
        const u = users.find(user => String(user._id) === String(vId));
        return u ? { _id: u._id, name: u.name, email: u.email } : vId;
      });
      const parts = (evt.participants || []).map(pId => {
        const u = users.find(user => String(user._id) === String(pId));
        return u ? { _id: u._id, name: u.name, email: u.email } : pId;
      });
      return {
        ...evt,
        organizerName: org ? org.name : 'Unknown Organizer',
        volunteers: vols,
        participants: parts
      };
    });

    res.status(200).json(enrichedEvents);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error retrieving events.' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await dataHelper.findById('Event', req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    
    const users = await dataHelper.find('User');
    const org = users.find(u => String(u._id) === String(event.organizer || event.organizationId));
    const vols = (event.volunteers || []).map(vId => {
      const u = users.find(user => String(user._id) === String(vId));
      return u ? { _id: u._id, name: u.name, email: u.email, profile: u.profile } : vId;
    });
    
    res.status(200).json({
      ...event,
      organizerName: org ? org.name : 'Unknown Organizer',
      volunteers: vols
    });
  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({ message: 'Server error retrieving event details.' });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const attendeeId = req.user.id;
    const tenant = await getOrCreateDefaultTenant();
    const organizationId = req.user?.tenantId || tenant._id;

    const event = await dataHelper.findById('Event', eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check duplicate participant registrations
    const existingTicket = await dataHelper.findOne('Ticket', { eventId, attendeeId });
    if (existingTicket) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const secureCheckInHash = crypto
      .createHash('sha256')
      .update(`${eventId}-${attendeeId}-${salt}`)
      .digest('hex');

    const newTicket = await dataHelper.create('Ticket', {
      organizationId,
      eventId,
      attendeeId,
      secureCheckInHash,
      status: 'Unused'
    });

    // In-memory QR code generation
    const qrPayload = JSON.stringify({
      ticketId: newTicket._id,
      hash: secureCheckInHash
    });

    const base64QR = await QRCode.toDataURL(qrPayload, {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 320,
      margin: 1
    });

    // Add user to participants list for compatibility
    await dataHelper.findByIdAndUpdate('Event', eventId, {
      $push: { participants: attendeeId }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event.',
      ticket: {
        id: newTicket._id,
        status: newTicket.status,
        qrCodeDataStream: base64QR,
        secureHash: secureCheckInHash
      }
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ message: 'Server error during event registration.' });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { description, amount, type } = req.body; // type is 'income' or 'expense'

    if (!description || amount === undefined || !type) {
      return res.status(400).json({ message: 'Description, amount, and type are required.' });
    }

    const event = await dataHelper.findById('Event', eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check permissions
    if (String(event.organizer) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized. Only the organizer can modify the budget.' });
    }

    const parsedAmount = Number(amount);
    const newItems = [...(event.budget?.items || []), { description, amount: parsedAmount, type }];
    
    let newIncome = Number(event.budget?.income || 0);
    let newExpenses = Number(event.budget?.expenses || 0);

    if (type === 'income') {
      newIncome += parsedAmount;
    } else {
      newExpenses += parsedAmount;
    }

    const updatedEvent = await dataHelper.findByIdAndUpdate('Event', eventId, {
      $set: {
        'budget.income': newIncome,
        'budget.expenses': newExpenses,
        'budget.items': newItems
      }
    });

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Server error during budget update.' });
  }
};
