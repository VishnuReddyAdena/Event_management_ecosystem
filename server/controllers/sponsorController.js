import { dataHelper } from '../models/dataHelper.js';

export const applyForSponsorship = async (req, res) => {
  try {
    const { eventId, packageId, message, sponsorAmount } = req.body;
    const userId = req.user.id;

    if (!eventId || !packageId) {
      return res.status(400).json({ message: 'Event ID and Package ID are required.' });
    }

    const event = await dataHelper.findById('Event', eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const selectedPkg = event.sponsorshipPackages.find(pkg => String(pkg._id) === String(packageId));
    if (!selectedPkg) {
      return res.status(404).json({ message: 'Sponsorship package not found.' });
    }

    if (selectedPkg.sold) {
      return res.status(400).json({ message: 'This sponsorship package has already been sold.' });
    }

    // Check if already applied
    const existingApp = await dataHelper.findOne('Application', {
      event: eventId,
      user: userId,
      type: 'sponsor',
      'details.packageId': packageId
    });

    if (existingApp) {
      return res.status(400).json({ message: `You have already applied for this package. Status: ${existingApp.status}` });
    }

    const newApplication = await dataHelper.create('Application', {
      event: eventId,
      user: userId,
      type: 'sponsor',
      status: 'pending',
      details: {
        message: message || '',
        packageId,
        sponsorAmount: Number(sponsorAmount) || selectedPkg.price
      }
    });

    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Apply for sponsorship error:', error);
    res.status(500).json({ message: 'Server error during sponsorship application.' });
  }
};

export const getMatchedEvents = async (req, res) => {
  try {
    const sponsor = await dataHelper.findById('User', req.user.id);
    if (!sponsor || sponsor.role !== 'sponsor') {
      return res.status(404).json({ message: 'Sponsor profile not found.' });
    }

    const targetTech = sponsor.sponsorProfile?.industryVerticals || ['React', 'Node.js'];
    const targetDomains = ['Web Development', 'Sustainability']; // Default values
    const targetAttendees = sponsor.sponsorProfile?.budgetCap ? Math.floor(sponsor.sponsorProfile.budgetCap / 100) : 100;

    const sponsorTechSet = targetTech.map(t => t.toLowerCase());
    const sponsorDomainSet = targetDomains.map(d => d.toLowerCase());

    const { checkUseMock } = await import('../config/db.js');
    const { Event: EventModel } = await import('../models/Schemas.js'); // direct mongoose access if online

    if (!checkUseMock()) {
      // Execute 5-stage database aggregation pipeline as specified in the blueprint
      const matches = await EventModel.aggregate([
        { $match: { status: 'Active' } },
        {
          $project: {
            title: 1,
            estimatedAttendees: 1,
            techStackFocus: { $ifNull: ['$targetTechStack', []] },
            eventDomains: { $ifNull: ['$eventDomains', []] },
            sponsorshipPackages: 1,
            date: 1,
            format: 1,
            venue: 1,
            description: 1,
            techIntersection: {
              $setIntersection: [{ $ifNull: ['$targetTechStack', []] }, sponsorTechSet]
            },
            techUnion: {
              $setUnion: [{ $ifNull: ['$targetTechStack', []] }, sponsorTechSet]
            },
            domainIntersection: {
              $setIntersection: [{ $ifNull: ['$eventDomains', []] }, sponsorDomainSet]
            },
            domainUnion: {
              $setUnion: [{ $ifNull: ['$eventDomains', []] }, sponsorDomainSet]
            }
          }
        },
        {
          $addFields: {
            techJaccard: {
              $cond: [
                { $gt: [{ $size: '$techUnion' }, 0] },
                { $divide: [{ $size: '$techIntersection' }, { $size: '$techUnion' }] },
                0
              ]
            },
            domainJaccard: {
              $cond: [
                { $gt: [{ $size: '$domainUnion' }, 0] },
                { $divide: [{ $size: '$domainIntersection' }, { $size: '$domainUnion' }] },
                0
              ]
            },
            attendanceRatio: {
              $min: [1.0, { $divide: ['$estimatedAttendees', targetAttendees || 100] }]
            }
          }
        },
        {
          $addFields: {
            matchingScore: {
              $add: [
                { $multiply: ['$techJaccard', 0.40] },
                { $multiply: ['$domainJaccard', 0.40] },
                { $multiply: ['$attendanceRatio', 0.20] }
              ]
            }
          }
        },
        {
          $addFields: {
            matchScore: { $multiply: ['$matchingScore', 100] },
            matchingDetails: [
              "Calculated matching based on Jaccard overlap overlap indices.",
              "Evaluated audience scaling ratio to target parameters."
            ]
          }
        },
        { $sort: { matchScore: -1 } },
        { $limit: 10 }
      ]);
      
      return res.status(200).json(matches);
    }

    // Fallback: Pure JavaScript evaluation of the Jaccard matching index algorithm
    const events = await dataHelper.find('Event');
    const matchedEvents = events.map(event => {
      const eventTech = (event.targetTechStack || []).map(t => t.toLowerCase());
      const eventDom = (event.eventDomains || []).map(d => d.toLowerCase());

      // Jaccard Intersection / Union for Tech
      const techIntersect = eventTech.filter(t => sponsorTechSet.includes(t));
      const techUnionSet = new Set([...eventTech, ...sponsorTechSet]);
      const techJaccard = techUnionSet.size > 0 ? techIntersect.length / techUnionSet.size : 0;

      // Jaccard Intersection / Union for Domain
      const domIntersect = eventDom.filter(d => sponsorDomainSet.includes(d));
      const domUnionSet = new Set([...eventDom, ...sponsorDomainSet]);
      const domJaccard = domUnionSet.size > 0 ? domIntersect.length / domUnionSet.size : 0;

      // Attendance Ratio
      const estAtt = event.estimatedAttendees || 150;
      const attendanceRatio = Math.min(1.0, estAtt / (targetAttendees || 100));

      // Weighted combination
      const score = (techJaccard * 0.40) + (domJaccard * 0.40) + (attendanceRatio * 0.20);
      const matchScore = Math.round(score * 100);

      const reasons = [
        `Tech stack overlap ratio: ${Math.round(techJaccard * 100)}%`,
        `Domain focus similarity: ${Math.round(domJaccard * 100)}%`,
        `Audience scale ratio: ${Math.round(attendanceRatio * 100)}%`
      ];

      return {
        ...event,
        matchScore,
        matchingDetails: reasons
      };
    });

    matchedEvents.sort((a, b) => b.matchScore - a.matchScore);
    res.status(200).json(matchedEvents.slice(0, 10));
  } catch (error) {
    console.error('Get matched events error:', error);
    res.status(500).json({ message: 'Server error matching events.' });
  }
};

export const getSponsorMarketplace = async (req, res) => {
  try {
    const events = await dataHelper.find('Event');
    const packagesList = [];

    events.forEach(evt => {
      (evt.sponsorshipPackages || []).forEach(pkg => {
        packagesList.push({
          ...pkg,
          eventId: evt._id,
          eventTitle: evt.title,
          eventDate: evt.date,
          eventType: evt.type
        });
      });
    });

    res.status(200).json(packagesList);
  } catch (error) {
    console.error('Get sponsor marketplace error:', error);
    res.status(500).json({ message: 'Server error loading sponsor marketplace.' });
  }
};
