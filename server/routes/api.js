import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { createEvent, getEvents, getEventById, registerForEvent, updateBudget } from '../controllers/eventController.js';
import {
  applyToVolunteer,
  getApplications,
  updateApplicationStatus,
  getTasks,
  createTask,
  updateTaskStatus,
  getVolunteerLeaderboard
} from '../controllers/volunteerController.js';
import {
  applyForSponsorship,
  getMatchedEvents,
  getSponsorMarketplace
} from '../controllers/sponsorController.js';
import {
  issueCertificate,
  getCertificates,
  verifyCertificate,
  generatePdfCertificate
} from '../controllers/certificateController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', authMiddleware, getProfile);

// --- Event Routes ---
router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.post('/events', authMiddleware, requireRole(['organizer']), createEvent);
router.post('/events/:id/register', authMiddleware, registerForEvent);
router.post('/events/:id/budget', authMiddleware, requireRole(['organizer']), updateBudget);

// --- Volunteer Routes ---
router.post('/volunteers/apply', authMiddleware, requireRole(['volunteer']), applyToVolunteer);
router.get('/volunteers/applications', authMiddleware, getApplications);
router.put('/volunteers/applications/:id', authMiddleware, updateApplicationStatus);
router.get('/volunteers/tasks', getTasks);
router.post('/volunteers/tasks', authMiddleware, requireRole(['organizer']), createTask);
router.put('/volunteers/tasks/:id', authMiddleware, updateTaskStatus);
router.get('/volunteers/leaderboard', getVolunteerLeaderboard);

// --- Sponsor Routes ---
router.post('/sponsors/apply', authMiddleware, requireRole(['sponsor']), applyForSponsorship);
router.get('/sponsors/matched', authMiddleware, requireRole(['sponsor']), getMatchedEvents);
router.get('/sponsors/marketplace', getSponsorMarketplace);

// --- Certificate Routes ---
router.post('/certificates/issue', authMiddleware, requireRole(['organizer']), issueCertificate);
router.get('/certificates', authMiddleware, getCertificates);
router.get('/certificates/verify/:code', verifyCertificate);
router.get('/certificates/generate', generatePdfCertificate);

export default router;
