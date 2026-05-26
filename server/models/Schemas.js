import mongoose from 'mongoose';

// ==========================================
// 1. ORGANIZATION MODEL (SaaS Tenant Root)
// ==========================================
const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  tier: { type: String, enum: ['Standard', 'Gold', 'Platinum'], default: 'Standard' }
}, { timestamps: true });

export const Organization = mongoose.model('Organization', organizationSchema);

// ==========================================
// 2. USER MODEL (Unified Authentication)
// ==========================================
const userSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['organizer', 'volunteer', 'sponsor', 'participant'], required: true },
  
  // Embedded Stakeholder Profile Data
  volunteerProfile: {
    skills: [String],
    performanceScore: { type: Number, default: 0 },
    achievements: [String],
    assignedTasksCount: { type: Number, default: 0 }
  },
  
  sponsorProfile: {
    companyName: { type: String },
    industryVerticals: [String],
    budgetCap: { type: Number },
    activeSponsorships: [String]
  },
  
  participantProfile: {
    collegeName: { type: String },
    collegeAddress: { type: String },
    studentId: { type: String },
    yearOfStudy: { type: String }
  }
}, { timestamps: true });

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
export const User = mongoose.model('User', userSchema);

// ==========================================
// 3. EVENT MODEL (Multi-sided Hub)
// ==========================================
const eventSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  format: { type: String, enum: ['hackathon', 'workshop', 'college'], required: true },
  status: { type: String, enum: ['Draft', 'Active', 'Completed'], default: 'Draft' },
  
  // Categorical Data points for Sponsor Matching Algorithms
  targetTechStack: [String],
  eventDomains: [String],
  estimatedAttendees: { type: Number, required: true },
  
  // Budget ledger configuration
  budget: {
    allocatedTotal: { type: Number, default: 0 },
    sponsorshipRevenue: { type: Number, default: 0 },
    operationalExpenses: { type: Number, default: 0 },
    items: [{
      description: String,
      amount: Number,
      type: { type: String, enum: ['income', 'expense'] }
    }]
  },
  
  // Volunteers needed and participants
  volunteersNeeded: { type: Number, default: 5 },
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const Event = mongoose.model('Event', eventSchema);

// ==========================================
// 4. KANBAN TASK MODEL (Volunteer Module)
// ==========================================
const taskSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['todo', 'inProgress', 'done'], default: 'todo' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  order: { type: Number, default: 0 }, // Order index for drag-and-drop operations
  pointValue: { type: Number, default: 10 }
}, { timestamps: true });

taskSchema.index({ eventId: 1, status: 1, order: 1 });
export const Task = mongoose.model('Task', taskSchema);

// ==========================================
// 5. SPONSORSHIP DEAL MODEL (Sponsor Module)
// ==========================================
const sponsorshipDealSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tierName: { type: String, required: true }, // 'Gold', 'Silver', etc.
  financialCommitment: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  roiMetrics: {
    impressionsCount: { type: Number, default: 0 },
    clicksRegistered: { type: Number, default: 0 }
  }
}, { timestamps: true });

export const SponsorshipDeal = mongoose.model('SponsorshipDeal', sponsorshipDealSchema);

// ==========================================
// 6. TICKET MODEL (Participant Registration)
// ==========================================
const ticketSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  secureCheckInHash: { type: String, required: true },
  status: { type: String, enum: ['Unused', 'Validated'], default: 'Unused' }
}, { timestamps: true });

ticketSchema.index({ eventId: 1, attendeeId: 1 }, { unique: true });
export const Ticket = mongoose.model('Ticket', ticketSchema);

// ==========================================
// 7. CERTIFICATE MODEL (Verifiable Achievement)
// ==========================================
const certificateSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  code: { type: String, required: true, unique: true },
  recipientName: { type: String, required: true },
  eventName: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ==========================================
// 8. APPLICATION MODEL (Compatibility Support)
// ==========================================
const applicationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['volunteer', 'sponsor'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  details: {
    message: String,
    skills: [String],
    packageId: String,
    sponsorAmount: Number
  }
}, { timestamps: true });

export const Application = mongoose.model('Application', applicationSchema);
export const Certificate = mongoose.model('Certificate', certificateSchema);
