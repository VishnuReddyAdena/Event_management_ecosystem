import bcrypt from 'bcryptjs';
import { dataHelper } from '../models/dataHelper.js';

export const seedDatabase = async () => {
  try {
    const existingUsers = await dataHelper.find('User');
    if (existingUsers.length > 0) {
      console.log('Database already has data. Skipping seeder.');
      return;
    }

    console.log('Seeding SaaS Multi-Tenant database...');

    // 1. Create Tenant Organization
    const organization = await dataHelper.create('Organization', {
      name: 'Tech University Organization',
      slug: 'tech_university',
      tier: 'Standard'
    });

    const tenantId = organization._id;
    console.log(`Tenant created: ${organization.name} [ID: ${tenantId}]`);

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('volunteer123', salt);

    // Create Organizers
    const organizer = await dataHelper.create('User', {
      tenantId,
      name: 'Dr. Sarah Jenkins',
      email: 'organizer@platform.com',
      passwordHash,
      role: 'organizer',
      volunteerProfile: { skills: [], performanceScore: 0, achievements: [], assignedTasksCount: 0 },
      sponsorProfile: { companyName: '', industryVerticals: [], budgetCap: 0, activeSponsorships: [] }
    });

    // Create Volunteers
    const volunteer1 = await dataHelper.create('User', {
      tenantId,
      name: 'Alice Smith',
      email: 'volunteer@platform.com',
      passwordHash,
      role: 'volunteer',
      volunteerProfile: {
        skills: ['React', 'JavaScript', 'CSS', 'Social Media', 'Discord Moderation'],
        performanceScore: 98,
        achievements: ['Bronze Organizer Helper', 'Silver Task Crusher'],
        assignedTasksCount: 2
      },
      sponsorProfile: { companyName: '', industryVerticals: [], budgetCap: 0, activeSponsorships: [] }
    });

    const volunteer2 = await dataHelper.create('User', {
      tenantId,
      name: 'Bob Johnson',
      email: 'bob.volunteer@platform.com',
      passwordHash,
      role: 'volunteer',
      volunteerProfile: {
        skills: ['Python', 'Networking', 'Logistics', 'Event Hosting'],
        performanceScore: 100,
        achievements: ['Bronze Organizer Helper', 'Network Ninja'],
        assignedTasksCount: 1
      },
      sponsorProfile: { companyName: '', industryVerticals: [], budgetCap: 0, activeSponsorships: [] }
    });

    // Create Sponsors
    const sponsor = await dataHelper.create('User', {
      tenantId,
      name: 'Marcus Vance',
      email: 'sponsor@platform.com',
      passwordHash,
      role: 'sponsor',
      volunteerProfile: { skills: [], performanceScore: 0, achievements: [], assignedTasksCount: 0 },
      sponsorProfile: {
        companyName: 'Vanguard Tech Solutions',
        industryVerticals: ['React', 'Node.js', 'Express', 'MongoDB'],
        budgetCap: 15000,
        activeSponsorships: ['Global Tech Hackathon 2026']
      }
    });

    // Create Participants
    const participant = await dataHelper.create('User', {
      tenantId,
      name: 'John Doe',
      email: 'participant@platform.com',
      passwordHash,
      role: 'participant',
      volunteerProfile: { skills: [], performanceScore: 0, achievements: [], assignedTasksCount: 0 },
      sponsorProfile: { companyName: '', industryVerticals: [], budgetCap: 0, activeSponsorships: [] }
    });

    console.log('SaaS Users Seeded.');

    // 3. Create Events
    const hackathon = await dataHelper.create('Event', {
      organizationId: tenantId,
      title: 'Global Tech Hackathon 2026',
      description: 'A 36-hour intensive software building hackathon designed to create web apps that solve environmental issues. Free food, stickers, and $10k in prizes!',
      date: '2026-07-15',
      time: '09:00',
      venue: 'Tech Auditorium, Building B',
      format: 'hackathon',
      status: 'Active',
      targetTechStack: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'],
      eventDomains: ['Web Development', 'Sustainability', 'Social good'],
      estimatedAttendees: 150,
      volunteersNeeded: 8,
      volunteers: [volunteer1._id, volunteer2._id],
      participants: [participant._id],
      budget: {
        allocatedTotal: 10000,
        sponsorshipRevenue: 5000,
        operationalExpenses: 2500,
        items: [
          { description: 'Sponsorship - Platinum Tier', amount: 5000, type: 'income' },
          { description: 'Catering & Food Services', amount: 1500, type: 'expense' },
          { description: 'Swag (T-shirts, stickers)', amount: 1000, type: 'expense' }
        ]
      }
    });

    const workshop = await dataHelper.create('Event', {
      organizationId: tenantId,
      title: 'Advanced Web Dev & Glassmorphism',
      description: 'Hands-on training session demonstrating next-gen UI building strategies, CSS filters, backdrop filters, and custom animation rendering in modern browsers.',
      date: '2026-06-10',
      time: '14:00',
      venue: 'Online - Zoom Conference Link',
      format: 'workshop',
      status: 'Active',
      targetTechStack: ['React', 'CSS', 'JavaScript'],
      eventDomains: ['Web Development', 'UI/UX Design'],
      estimatedAttendees: 80,
      volunteersNeeded: 3,
      volunteers: [volunteer1._id],
      participants: [participant._id],
      budget: {
        allocatedTotal: 1200,
        sponsorshipRevenue: 0,
        operationalExpenses: 150,
        items: [
          { description: 'Zoom Premium Subscription', amount: 50, type: 'expense' },
          { description: 'Digital Marketing Ads', amount: 100, type: 'expense' }
        ]
      }
    });

    console.log('Events Seeded.');

    // 4. Create Kanban Tasks
    await dataHelper.create('Task', {
      eventId: hackathon._id,
      title: 'Design Hackathon Web Landing Page',
      description: 'Produce high fidelity layouts and visual designs incorporating black & white glassmorphism aesthetics.',
      status: 'done',
      assignedTo: volunteer1._id,
      order: 1000,
      pointValue: 15
    });

    await dataHelper.create('Task', {
      eventId: hackathon._id,
      title: 'Setup Discord Server Channels',
      description: 'Create channels, permissions, and set up role bots for hackathon participant onboarding.',
      status: 'inProgress',
      assignedTo: volunteer1._id,
      order: 2000,
      pointValue: 15
    });

    await dataHelper.create('Task', {
      eventId: hackathon._id,
      title: 'Configure Networking Router Switches',
      description: 'Configure high-performance routing hardware inside the university hall to handle 200 developers.',
      status: 'inProgress',
      assignedTo: volunteer2._id,
      order: 3000,
      pointValue: 15
    });

    await dataHelper.create('Task', {
      eventId: hackathon._id,
      title: 'Coordinate Food Caterers',
      description: 'Confirm menu details, delivery schedules, and vegetarian options with local restaurants.',
      status: 'todo',
      assignedTo: null,
      order: 4000,
      pointValue: 15
    });

    await dataHelper.create('Task', {
      eventId: workshop._id,
      title: 'Zoom Moderation Setup',
      description: 'Prepare session polls and structure chat moderation guidelines for speakers.',
      status: 'todo',
      assignedTo: volunteer1._id,
      order: 1000,
      pointValue: 15
    });

    console.log('Kanban Tasks Seeded.');

    // 5. Create Applications
    await dataHelper.create('Application', {
      event: hackathon._id,
      user: volunteer1._id,
      type: 'volunteer',
      status: 'approved',
      details: {
        message: 'I have volunteered for 3 college fests. Excited to support!',
        skills: ['React', 'CSS', 'Social Media']
      }
    });

    await dataHelper.create('Application', {
      event: hackathon._id,
      user: volunteer2._id,
      type: 'volunteer',
      status: 'approved',
      details: {
        message: 'Networking and hardware enthusiast. Ready to Wi-Fi setup.',
        skills: ['Networking', 'Logistics']
      }
    });

    // 6. Create Sponsorship Deal
    await dataHelper.create('SponsorshipDeal', {
      eventId: hackathon._id,
      sponsorId: sponsor._id,
      tierName: 'Platinum Tier',
      financialCommitment: 5000,
      status: 'Approved',
      roiMetrics: { impressionsCount: 1800, clicksRegistered: 240 }
    });

    // 7. Create Ticket Pass
    await dataHelper.create('Ticket', {
      organizationId: tenantId,
      eventId: hackathon._id,
      attendeeId: participant._id,
      secureCheckInHash: 'A5E12F98BD92348C37FE918B7362DF920193EAF98C224DE591EFE8A271FF391E',
      status: 'Unused'
    });

    // 8. Create Certificates
    await dataHelper.create('Certificate', {
      eventId: workshop._id,
      userId: participant._id,
      code: 'CERT-WOR-SPRING2026-A1B2C3',
      recipientName: participant.name,
      eventName: 'Spring Coding Sprint 2026',
      issuedAt: new Date('2026-04-05T18:00:00.000Z').toISOString()
    });

    console.log('Database seeded successfully! 🎉');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
