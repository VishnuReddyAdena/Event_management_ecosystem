import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dataHelper } from '../models/dataHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'event_management_ecosystem_secret_key_2026';

// Helper to get or create default organization tenant
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

export const register = async (req, res) => {
  try {
    const { name, email, password, role, profile } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields (name, email, password, role) are required.' });
    }
    
    // Check if user already exists
    const existingUser = await dataHelper.findOne('User', { email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }
    
    // Get/create tenant organization
    const tenant = await getOrCreateDefaultTenant();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Initialize default profile structures matching blueprint
    const volunteerProfile = {
      skills: role === 'volunteer' ? (profile?.skills || []) : [],
      performanceScore: role === 'volunteer' ? (profile?.performanceScore || 100) : 0,
      achievements: role === 'volunteer' ? (profile?.badges || []) : [],
      assignedTasksCount: 0
    };
    
    const sponsorProfile = {
      companyName: role === 'sponsor' ? (profile?.company || '') : '',
      industryVerticals: role === 'sponsor' ? [profile?.industry || ''] : [],
      budgetCap: role === 'sponsor' ? (profile?.budget || 0) : 0,
      activeSponsorships: []
    };

    const participantProfile = {
      collegeName: role === 'participant' ? (profile?.collegeName || '') : '',
      collegeAddress: role === 'participant' ? (profile?.collegeAddress || '') : '',
      studentId: role === 'participant' ? (profile?.studentId || '') : '',
      yearOfStudy: role === 'participant' ? (profile?.year || '') : ''
    };
    
    const newUser = await dataHelper.create('User', {
      tenantId: tenant._id,
      name,
      email,
      passwordHash: hashedPassword,
      role,
      volunteerProfile,
      sponsorProfile,
      participantProfile
    });
    
    // Generate token containing tenantId context
    const token = jwt.sign({ id: newUser._id, role: newUser.role, tenantId: newUser.tenantId }, JWT_SECRET, { expiresIn: '7d' });
    
    // Clean user response
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      token,
      user: {
        ...userWithoutPassword,
        // Mapper back for frontend compatibility
        profile: {
          bio: '',
          phone: '',
          skills: volunteerProfile.skills,
          performanceScore: volunteerProfile.performanceScore,
          points: volunteerProfile.performanceScore, // fallback map
          badges: volunteerProfile.achievements,
          company: sponsorProfile.companyName,
          industry: sponsorProfile.industryVerticals[0],
          budget: sponsorProfile.budgetCap,
          collegeName: participantProfile.collegeName,
          collegeAddress: participantProfile.collegeAddress,
          studentId: participantProfile.studentId,
          yearOfStudy: participantProfile.yearOfStudy
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    
    const user = await dataHelper.findOne('User', { email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    const savedPasswordHash = user.passwordHash || user.password; // compatibility fallback
    const isMatch = await bcrypt.compare(password, savedPasswordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    const token = jwt.sign({ id: user._id, role: user.role, tenantId: user.tenantId }, JWT_SECRET, { expiresIn: '7d' });
    
    const { passwordHash: _, password: __, ...userWithoutPassword } = user;
    
    // Map profiles back to client state structure
    const mappedUser = {
      ...userWithoutPassword,
      profile: {
        bio: '',
        phone: '',
        skills: user.volunteerProfile?.skills || [],
        performanceScore: user.volunteerProfile?.performanceScore || 100,
        points: user.volunteerProfile?.performanceScore || 100,
        badges: user.volunteerProfile?.achievements || [],
        company: user.sponsorProfile?.companyName || '',
        industry: user.sponsorProfile?.industryVerticals?.[0] || '',
        budget: user.sponsorProfile?.budgetCap || 0,
        collegeName: user.participantProfile?.collegeName || '',
        collegeAddress: user.participantProfile?.collegeAddress || '',
        studentId: user.participantProfile?.studentId || '',
        yearOfStudy: user.participantProfile?.yearOfStudy || ''
      }
    };
    
    res.status(200).json({
      token,
      user: mappedUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await dataHelper.findById('User', req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    const { passwordHash: _, password: __, ...userWithoutPassword } = user;
    
    const mappedUser = {
      ...userWithoutPassword,
      profile: {
        bio: '',
        phone: '',
        skills: user.volunteerProfile?.skills || [],
        performanceScore: user.volunteerProfile?.performanceScore || 100,
        points: user.volunteerProfile?.performanceScore || 100,
        badges: user.volunteerProfile?.achievements || [],
        company: user.sponsorProfile?.companyName || '',
        industry: user.sponsorProfile?.industryVerticals?.[0] || '',
        budget: user.sponsorProfile?.budgetCap || 0,
        collegeName: user.participantProfile?.collegeName || '',
        collegeAddress: user.participantProfile?.collegeAddress || '',
        studentId: user.participantProfile?.studentId || '',
        yearOfStudy: user.participantProfile?.yearOfStudy || ''
      }
    };
    
    res.status(200).json(mappedUser);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile.' });
  }
};
