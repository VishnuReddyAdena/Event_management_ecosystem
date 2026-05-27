import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://event-management-ecosystem.onrender.com/api';

export const AppProvider = ({ children }) => {
  const { user, token, setUser, login: authLogin, signup: authSignup, logout: authLogout } = useAuth();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Helper for requests
  const apiRequest = async (endpoint, method = 'GET', body = null, useAuth = true) => {
    if (isOfflineMode) {
      throw new Error('OFFLINE_MODE');
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    if (useAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API Request Failed');
      }
      return data;
    } catch (err) {
      console.warn(`API error on ${endpoint}:`, err.message);
      if (err.message.includes('Failed to fetch') || err.message === 'Load failed') {
        // Automatically activate offline mode
        setIsOfflineMode(true);
        showToast('⚡ Running in Offline Demo Mode. Connecting to client memory.', 'warning');
        throw new Error('OFFLINE_MODE');
      }
      throw err;
    }
  };

  // Check backend availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await fetch(`${API_BASE_URL}/events`);
        setIsOfflineMode(false);
      } catch (err) {
        setIsOfflineMode(true);
        console.log('Backend not detected. Using frontend local storage fallback.');
      }
    };
    checkBackend();
  }, [token]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [token, isOfflineMode]);

  // Auto-login participant deactivated to allow normal signup/login flows
  /*
  useEffect(() => {
    const performAutoLogin = async () => {
      const loggedOut = sessionStorage.getItem('logged_out') === 'true';
      if (!token && !user && !loggedOut) {
        try {
          await login('participant@platform.com', 'volunteer123');
        } catch (err) {
          console.warn('Auto-login failed:', err.message);
        }
      }
    };
    performAutoLogin();
  }, [token, user]);
  */

  const loadData = async () => {
    setLoading(true);
    if (!isOfflineMode) {
      try {
        const evts = await apiRequest('/events', 'GET', null, false);
        setEvents(evts);

        const lb = await apiRequest('/volunteers/leaderboard', 'GET', null, false);
        setLeaderboard(lb);

        if (token) {
          const profile = await apiRequest('/auth/profile', 'GET', null, true);
          setUser(profile);

          const apps = await apiRequest('/volunteers/applications', 'GET', null, true);
          setApplications(apps);

          const certs = await apiRequest('/certificates', 'GET', null, true);
          setCertificates(certs);
        }
      } catch (err) {
        if (err.message === 'OFFLINE_MODE') {
          loadMockData();
        }
      } finally {
        setLoading(false);
      }
    } else {
      loadMockData();
      setLoading(false);
    }
  };

  // Mock Data Setup for Offline Fallback
  const loadMockData = () => {
    // Read or write mock data to localStorage
    let mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    let mockEvents = JSON.parse(localStorage.getItem('mock_events') || '[]');
    let mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');
    let mockApps = JSON.parse(localStorage.getItem('mock_applications') || '[]');
    let mockCerts = JSON.parse(localStorage.getItem('mock_certificates') || '[]');

    if (mockUsers.length === 0) {
      // Seed frontend storage
      mockUsers = [
        {
          _id: 'u1',
          name: 'Dr. Sarah Jenkins',
          email: 'organizer@platform.com',
          role: 'organizer',
          profile: { bio: 'Dean of Computing. Enthusiastic about student hackathons.', phone: '+1 555-0199' }
        },
        {
          _id: 'u2',
          name: 'Alice Smith',
          email: 'volunteer@platform.com',
          role: 'volunteer',
          profile: {
            skills: ['React', 'JavaScript', 'CSS', 'Social Media', 'Discord Moderation'],
            bio: 'CS Sophomore. Loves competitive hackathons.',
            phone: '+1 555-0234',
            performanceScore: 98,
            points: 45,
            badges: ['Bronze Organizer Helper', 'Silver Task Crusher']
          }
        },
        {
          _id: 'u3',
          name: 'Marcus Vance',
          email: 'sponsor@platform.com',
          role: 'sponsor',
          profile: { company: 'Vanguard Tech Solutions', industry: 'Tech & Software Development', budget: 15000, bio: 'Custom software agency.' }
        },
        {
          _id: 'u4',
          name: 'John Doe',
          email: 'participant@platform.com',
          role: 'participant',
          profile: { bio: 'Full stack learner.', phone: '+1 555-0456' }
        }
      ];
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    if (mockEvents.length === 0) {
      mockEvents = [
        {
          _id: 'e1',
          title: 'Global Tech Hackathon 2026',
          description: 'A 36-hour intensive software building hackathon designed to create web apps that solve environmental issues. Free food, stickers, and $10k in prizes!',
          date: '2026-07-15',
          time: '09:00',
          venue: 'Tech Auditorium, Building B',
          type: 'hackathon',
          organizer: 'u1',
          organizerName: 'Dr. Sarah Jenkins',
          sponsorshipPackages: [
            { _id: 'p1', name: 'Platinum Tier', price: 5000, benefits: ['Keynote speech slot', 'Banner at entrance', 'Logo on t-shirts'], sold: true, sponsor: 'u3' },
            { _id: 'p2', name: 'Gold Tier', price: 2500, benefits: ['Dedicated sponsor booth', 'Logo on site & shirts'], sold: false, sponsor: null },
            { _id: 'p3', name: 'Silver Tier', price: 1000, benefits: ['Logo on site', '1 Social Media shoutout'], sold: false, sponsor: null }
          ],
          budget: {
            income: 5000,
            expenses: 2500,
            items: [
              { description: 'Sponsorship - Platinum Tier', amount: 5000, type: 'income' },
              { description: 'Catering & Food Services', amount: 1500, type: 'expense' },
              { description: 'Swag (T-shirts, stickers)', amount: 1000, type: 'expense' }
            ]
          },
          volunteersNeeded: 8,
          volunteers: ['u2'],
          participants: ['u4']
        },
        {
          _id: 'e2',
          title: 'Advanced Web Dev & Glassmorphism',
          description: 'Hands-on training session demonstrating next-gen UI building strategies, CSS filters, backdrop filters, and custom animation rendering in modern browsers.',
          date: '2026-06-10',
          time: '14:00',
          venue: 'Online - Zoom Conference Link',
          type: 'workshop',
          organizer: 'u1',
          organizerName: 'Dr. Sarah Jenkins',
          sponsorshipPackages: [
            { _id: 'p4', name: 'Elite Sponsor', price: 1200, benefits: ['15-minute presentation slot', 'Logo displayed on slides'], sold: false, sponsor: null },
            { _id: 'p5', name: 'Standard Sponsor', price: 500, benefits: ['Logo displayed on slides', 'Social media shoutout'], sold: false, sponsor: null }
          ],
          budget: {
            income: 0,
            expenses: 150,
            items: [
              { description: 'Zoom Premium Subscription', amount: 50, type: 'expense' },
              { description: 'Digital Marketing Ads', amount: 100, type: 'expense' }
            ]
          },
          volunteersNeeded: 3,
          volunteers: ['u2'],
          participants: []
        }
      ];
      localStorage.setItem('mock_events', JSON.stringify(mockEvents));
    }

    if (mockTasks.length === 0) {
      mockTasks = [
        { _id: 't1', title: 'Design Hackathon Web Landing Page', description: 'Frosted glass look', status: 'completed', assignedTo: 'u2', event: 'e1' },
        { _id: 't2', title: 'Setup Discord Server Channels', description: 'Bots and role configs', status: 'in_progress', assignedTo: 'u2', event: 'e1' },
        { _id: 't3', title: 'Coordinate Food Caterers', description: 'Confirm vegetarian options', status: 'todo', assignedTo: null, event: 'e1' }
      ];
      localStorage.setItem('mock_tasks', JSON.stringify(mockTasks));
    }

    if (mockCerts.length === 0) {
      mockCerts = [
        {
          _id: 'c1',
          event: 'e3',
          user: 'u4',
          code: 'CERT-WOR-SPRING2026-A1B2C3',
          recipientName: 'John Doe',
          eventName: 'Spring Coding Sprint 2026',
          issuedAt: '2026-04-05T18:00:00.000Z'
        }
      ];
      localStorage.setItem('mock_certificates', JSON.stringify(mockCerts));
    }

    setEvents(mockEvents);
    setTasks(mockTasks);
    setApplications(mockApps);
    setCertificates(mockCerts);
    
    // Calculate leaderboard from mock data
    const vols = mockUsers.filter(u => u.role === 'volunteer');
    const sortedVols = vols.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      points: u.profile?.points || 0,
      performanceScore: u.profile?.performanceScore || 100,
      skills: u.profile?.skills || [],
      badges: u.profile?.badges || []
    })).sort((a,b) => b.points - a.points);
    setLeaderboard(sortedVols);

    // If local token exists, authenticate the session with corresponding mock user
    if (token) {
      const savedUser = JSON.parse(sessionStorage.getItem('mock_user_session'));
      if (savedUser) {
        setUser(savedUser);
      }
    }
  };

  // AUTH ACTIONS
  const login = async (email, password) => {
    setLoading(true);
    sessionStorage.removeItem('logged_out');
    try {
      const u = await authLogin(email, password);
      showToast(`Welcome back, ${u.firstName || u.name}!`);
      return u;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role, profile = {}) => {
    setLoading(true);
    try {
      const firstName = name.split(' ')[0] || '';
      const lastName = name.split(' ').slice(1).join(' ') || '';
      
      const timestamp = Date.now();
      const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(2, 11);
      
      const msgBuffer = new TextEncoder().encode(`${email}${role}${timestamp}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const verificationHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const userData = {
        firstName,
        lastName,
        email,
        role,
        profileData: {
          bio: profile.bio || '',
          phone: profile.phone || '',
          skills: profile.skills || [],
          company: profile.company || '',
          industry: profile.industry || '',
          budget: Number(profile.budget) || 0,
          collegeName: profile.collegeName || '',
          collegeAddress: profile.collegeAddress || '',
          studentId: profile.studentId || '',
          yearOfStudy: profile.year || ''
        },
        token: mockToken,
        verificationHash
      };

      const newUser = await authSignup(userData);
      showToast('Account registered successfully!');
      return newUser;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authLogout();
    showToast('Logged out successfully.');
  };

  // EVENT ACTIONS
  const createEvent = async (eventData) => {
    try {
      if (!isOfflineMode) {
        const data = await apiRequest('/events', 'POST', eventData);
        setEvents(prev => [...prev, data]);
        showToast('Event created successfully!');
        return data;
      } else {
        const mockEvents = JSON.parse(localStorage.getItem('mock_events') || '[]');
        const newEvt = {
          _id: 'e_' + Math.random().toString(36).substr(2, 9),
          ...eventData,
          organizer: user._id,
          organizerName: user.name,
          volunteers: [],
          participants: [],
          sponsorshipPackages: (eventData.sponsorshipPackages || []).map(p => ({
            _id: 'p_' + Math.random().toString(36).substr(2, 9),
            ...p,
            sold: false,
            sponsor: null
          })),
          budget: {
            income: Number(eventData.budget?.income) || 0,
            expenses: Number(eventData.budget?.expenses) || 0,
            items: eventData.budget?.items || []
          }
        };
        mockEvents.push(newEvt);
        localStorage.setItem('mock_events', JSON.stringify(mockEvents));
        setEvents(mockEvents);
        showToast('Event created (Demo Mode)!');
        return newEvt;
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const registerForEvent = async (eventId) => {
    try {
      if (!isOfflineMode) {
        const data = await apiRequest(`/events/${eventId}/register`, 'POST');
        loadData();
        showToast('Successfully registered for this event!');
        return data;
      } else {
        const mockEvents = JSON.parse(localStorage.getItem('mock_events') || '[]');
        const evIndex = mockEvents.findIndex(e => e._id === eventId);
        if (evIndex !== -1) {
          if (!mockEvents[evIndex].participants) mockEvents[evIndex].participants = [];
          if (mockEvents[evIndex].participants.includes(user._id)) {
            showToast('Already registered!', 'warning');
            return;
          }
          mockEvents[evIndex].participants.push(user._id);
          localStorage.setItem('mock_events', JSON.stringify(mockEvents));
          setEvents(mockEvents);
          showToast('Registered for Event (Demo Mode)!');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updateBudget = async (eventId, budgetItem) => {
    try {
      if (!isOfflineMode) {
        const data = await apiRequest(`/events/${eventId}/budget`, 'POST', budgetItem);
        setEvents(prev => prev.map(e => e._id === eventId ? data : e));
        showToast('Budget ledger updated!');
        return data;
      } else {
        const mockEvents = JSON.parse(localStorage.getItem('mock_events') || '[]');
        const evIndex = mockEvents.findIndex(e => e._id === eventId);
        if (evIndex !== -1) {
          const ev = mockEvents[evIndex];
          if (!ev.budget) ev.budget = { income: 0, expenses: 0, items: [] };
          
          const amount = Number(budgetItem.amount);
          ev.budget.items.push({
            description: budgetItem.description,
            amount,
            type: budgetItem.type
          });

          if (budgetItem.type === 'income') {
            ev.budget.income += amount;
          } else {
            ev.budget.expenses += amount;
          }

          localStorage.setItem('mock_events', JSON.stringify(mockEvents));
          setEvents(mockEvents);
          showToast('Ledger updated (Demo Mode)!');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // KANBAN / VOLUNTEER ACTIONS
  const applyToVolunteer = async (eventId, message, skills) => {
    try {
      if (!isOfflineMode) {
        const data = await apiRequest('/volunteers/apply', 'POST', { eventId, message, skills });
        setApplications(prev => [...prev, data]);
        showToast('Application sent to organizer.');
        return data;
      } else {
        const mockApps = JSON.parse(localStorage.getItem('mock_applications') || '[]');
        const newApp = {
          _id: 'a_' + Math.random().toString(36).substr(2, 9),
          event: eventId,
          user: { _id: user._id, name: user.name, email: user.email, profile: user.profile },
          type: 'volunteer',
          status: 'pending',
          details: { message, skills }
        };
        mockApps.push(newApp);
        localStorage.setItem('mock_applications', JSON.stringify(mockApps));
        setApplications(mockApps);
        showToast('Application filed (Demo Mode).');
        return newApp;
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updateApplication = async (appId, status) => {
    try {
      if (!isOfflineMode) {
        const data = await apiRequest(`/volunteers/applications/${appId}`, 'PUT', { status });
        showToast(`Application ${status}!`);
        loadData();
        return data;
      } else {
        const mockApps = JSON.parse(localStorage.getItem('mock_applications') || '[]');
        const mockEvents = JSON.parse(localStorage.getItem('mock_events') || '[]');
        const appIndex = mockApps.findIndex(a => a._id === appId);
        if (appIndex !== -1) {
          mockApps[appIndex].status = status;
          const app = mockApps[appIndex];
          
          if (status === 'approved') {
            const ev = mockEvents.find(e => e._id === (app.event._id || app.event));
            if (ev) {
              if (app.type === 'volunteer') {
                const volId = app.user._id || app.user;
                if (!ev.volunteers.includes(volId)) ev.volunteers.push(volId);
              } else if (app.type === 'sponsor') {
                const packageId = app.details?.packageId;
                const pkg = ev.sponsorshipPackages.find(p => p._id === packageId);
                if (pkg) {
                  pkg.sold = true;
                  pkg.sponsor = app.user._id || app.user;
                  
                  // Credit income
                  if (!ev.budget) ev.budget = { income: 0, expenses: 0, items: [] };
                  ev.budget.income += pkg.price;
                  ev.budget.items.push({
                    description: `Sponsorship Package: ${pkg.name}`,
                    amount: pkg.price,
                    type: 'income'
                  });
                }
              }
            }
          }
          
          localStorage.setItem('mock_applications', JSON.stringify(mockApps));
          localStorage.setItem('mock_events', JSON.stringify(mockEvents));
          setApplications(mockApps);
          setEvents(mockEvents);
          showToast(`Application ${status} (Demo Mode).`);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const loadTasks = async (eventId) => {
    if (!isOfflineMode) {
      try {
        const data = await apiRequest(`/volunteers/tasks?eventId=${eventId}`);
        setTasks(data);
      } catch (err) {
        if (err.message === 'OFFLINE_MODE') {
          const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');
          setTasks(mockTasks.filter(t => t.event === eventId));
        }
      }
    } else {
      const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');
      setTasks(mockTasks.filter(t => t.event === eventId));
    }
  };

  const createTask = async (taskData) => {
    try {
      if (!isOfflineMode) {
        const data = await apiRequest('/volunteers/tasks', 'POST', taskData);
        setTasks(prev => [...prev, data]);
        showToast('Task added to backlog.');
        return data;
      } else {
        const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');
        const newT = {
          _id: 't_' + Math.random().toString(36).substr(2, 9),
          title: taskData.title,
          description: taskData.description || '',
          status: 'todo',
          assignedTo: taskData.assignedTo || null,
          event: taskData.eventId
        };
        mockTasks.push(newT);
        localStorage.setItem('mock_tasks', JSON.stringify(mockTasks));
        setTasks(prev => [...prev, newT]);
        showToast('Task created (Demo Mode).');
        return newT;
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      if (!isOfflineMode) {
        const data = await apiRequest(`/volunteers/tasks/${taskId}`, 'PUT', { status });
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
        showToast(`Task moved to ${status === 'inProgress' ? 'In Progress' : status}.`);
        loadData(); // Reload profile points
        return data;
      } else {
        const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');
        const tIndex = mockTasks.findIndex(t => t._id === taskId);
        if (tIndex !== -1) {
          const prevStatus = mockTasks[tIndex].status;
          mockTasks[tIndex].status = status;
          localStorage.setItem('mock_tasks', JSON.stringify(mockTasks));
          setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
          
          // Reward volunteer
          const assigneeId = mockTasks[tIndex].assignedTo;
          if (status === 'done' && prevStatus !== 'done' && assigneeId) {
            const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
            const uIndex = mockUsers.findIndex(u => u._id === assigneeId);
            if (uIndex !== -1) {
              const u = mockUsers[uIndex];
              if (!u.profile.points) u.profile.points = 0;
              u.profile.points += 15;
              u.profile.performanceScore = Math.min(100, (u.profile.performanceScore || 100) + 2);
              
              if (!u.profile.badges) u.profile.badges = [];
              if (u.profile.points >= 30 && !u.profile.badges.includes('Bronze Organizer Helper')) {
                u.profile.badges.push('Bronze Organizer Helper');
              }
              if (u.profile.points >= 60 && !u.profile.badges.includes('Silver Task Crusher')) {
                u.profile.badges.push('Silver Task Crusher');
              }
              
              localStorage.setItem('mock_users', JSON.stringify(mockUsers));
              
              if (user && user._id === assigneeId) {
                const updatedSession = { ...user, profile: u.profile };
                setUser(updatedSession);
                sessionStorage.setItem('mock_user_session', JSON.stringify(updatedSession));
              }
              showToast('🎉 Task completed! +15 points rewarded!', 'success');
            }
          } else {
            showToast('Task updated (Demo Mode).');
          }
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // SPONSOR ACTIONS
  const applyForSponsorship = async (eventId, packageId, message, sponsorAmount) => {
    try {
      if (!isOfflineMode) {
        const data = await apiRequest('/sponsors/apply', 'POST', { eventId, packageId, message, sponsorAmount });
        showToast('Sponsorship proposal sent to organizer.');
        return data;
      } else {
        const mockApps = JSON.parse(localStorage.getItem('mock_applications') || '[]');
        const mockEvents = JSON.parse(localStorage.getItem('mock_events') || '[]');
        const ev = mockEvents.find(e => e._id === eventId);
        
        const newApp = {
          _id: 'a_' + Math.random().toString(36).substr(2, 9),
          event: { _id: eventId, title: ev?.title, organizer: ev?.organizer },
          user: { _id: user._id, name: user.name, email: user.email, profile: user.profile },
          type: 'sponsor',
          status: 'pending',
          details: { message, packageId, sponsorAmount }
        };
        
        mockApps.push(newApp);
        localStorage.setItem('mock_applications', JSON.stringify(mockApps));
        setApplications(mockApps);
        showToast('Sponsorship offer submitted (Demo Mode).');
        return newApp;
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getMatchedEvents = async () => {
    if (!isOfflineMode) {
      try {
        return await apiRequest('/sponsors/matched');
      } catch (err) {
        if (err.message === 'OFFLINE_MODE') {
          return runLocalSponsorMatcher();
        }
        return [];
      }
    } else {
      return runLocalSponsorMatcher();
    }
  };

  const runLocalSponsorMatcher = () => {
    const mockEvents = JSON.parse(localStorage.getItem('mock_events') || '[]');
    const industry = (user?.profile?.industry || '').toLowerCase();
    const budget = Number(user?.profile?.budget || 0);

    return mockEvents.map(event => {
      let score = 25;
      const reasons = [];

      const titleLower = event.title.toLowerCase();
      const descLower = event.description.toLowerCase();
      const typeLower = event.type.toLowerCase();

      let match = false;
      if (industry) {
        if (industry.includes('tech') || industry.includes('software')) {
          if (typeLower === 'hackathon' || titleLower.includes('code') || descLower.includes('tech')) {
            score += 30;
            match = true;
            reasons.push('Excellent match for Tech industry: Hackathons & Tech Workshops.');
          }
        } else if (industry.includes('edu') || industry.includes('learn')) {
          if (typeLower === 'workshop' || titleLower.includes('learn')) {
            score += 30;
            match = true;
            reasons.push('Perfect match for Education industry: Academic Workshops.');
          }
        }
      }

      if (!match && industry) {
        if (descLower.includes(industry)) {
          score += 15;
          reasons.push(`Event topics related to ${industry}.`);
        } else {
          score += 5;
          reasons.push('General event audience alignment.');
        }
      }

      const prices = (event.sponsorshipPackages || []).map(p => p.price);
      const minP = prices.length > 0 ? Math.min(...prices) : 0;
      const maxP = prices.length > 0 ? Math.max(...prices) : 0;

      if (budget > 0) {
        if (budget >= maxP) {
          score += 30;
          reasons.push(`Budget (${budget}) fully covers top tier packages (${maxP}).`);
        } else if (budget >= minP) {
          score += 20;
          reasons.push(`Budget (${budget}) covers starting packages (${minP}).`);
        } else {
          score -= 10;
          reasons.push(`Minimum packages (${minP}) exceed current budget.`);
        }
      }

      const pCount = (event.participants || []).length;
      if (pCount > 10) {
        score += 20;
        reasons.push('High visibility event: Large audience scale.');
      } else {
        score += 10;
        reasons.push('Mid-scale event: Highly focused niche audience.');
      }

      return {
        ...event,
        matchScore: Math.min(100, Math.max(0, score)),
        matchingDetails: reasons
      };
    }).sort((a,b) => b.matchScore - a.matchScore);
  };

  // CERTIFICATE ACTIONS
  const issueCertificate = async (eventId, participantId) => {
    try {
      if (!isOfflineMode) {
        const data = await apiRequest('/certificates/issue', 'POST', { eventId, userId: participantId });
        setCertificates(prev => [...prev, data]);
        showToast('Certificate generated & issued!');
        return data;
      } else {
        const mockCerts = JSON.parse(localStorage.getItem('mock_certificates') || '[]');
        const mockEvents = JSON.parse(localStorage.getItem('mock_events') || '[]');
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');

        const ev = mockEvents.find(e => e._id === eventId);
        const u = mockUsers.find(usr => usr._id === participantId);

        const checkExist = mockCerts.find(c => c.event === eventId && c.user === participantId);
        if (checkExist) {
          showToast('Already issued!', 'warning');
          return;
        }

        const newCert = {
          _id: 'c_' + Math.random().toString(36).substr(2, 9),
          event: eventId,
          user: participantId,
          code: `CERT-${ev?.type.substring(0,3).toUpperCase() || 'EVT'}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          recipientName: u?.name || 'Participant Name',
          eventName: ev?.title || 'Event Title',
          issuedAt: new Date().toISOString()
        };

        mockCerts.push(newCert);
        localStorage.setItem('mock_certificates', JSON.stringify(mockCerts));
        setCertificates(mockCerts);
        showToast('Certificate generated (Demo Mode)!');
        return newCert;
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const verifyCertificate = async (code) => {
    if (!isOfflineMode) {
      try {
        return await apiRequest(`/certificates/verify/${code}`, 'GET', null, false);
      } catch (err) {
        if (err.message === 'OFFLINE_MODE') {
          return runLocalCertificateVerify(code);
        }
        throw err;
      }
    } else {
      return runLocalCertificateVerify(code);
    }
  };

  const runLocalCertificateVerify = (code) => {
    const mockCerts = JSON.parse(localStorage.getItem('mock_certificates') || '[]');
    const matched = mockCerts.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (matched) {
      return {
        verified: true,
        message: 'Certificate verified successfully.',
        certificate: matched
      };
    } else {
      throw new Error('Certificate not found. Verification failed.');
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      token,
      events,
      tasks,
      applications,
      certificates,
      leaderboard,
      loading,
      toast,
      isOfflineMode,
      login,
      signup,
      logout,
      createEvent,
      registerForEvent,
      updateBudget,
      applyToVolunteer,
      updateApplication,
      loadTasks,
      createTask,
      updateTaskStatus,
      applyForSponsorship,
      getMatchedEvents,
      issueCertificate,
      verifyCertificate,
      showToast
    }}>
      {children}
      {toast && (
        <div className={`notification glass-panel`} style={{
          borderLeft: toast.type === 'error' ? '4px solid rgba(255, 255, 255, 0.3)' : 
                       toast.type === 'warning' ? '4px solid rgba(255, 255, 255, 0.6)' : '4px solid #ffffff',
          background: 'rgba(10, 10, 12, 0.9)',
          color: '#ffffff'
        }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>
              {toast.type === 'error' ? 'Error' : toast.type === 'warning' ? 'System' : 'Success'}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#d1d5db' }}>{toast.message}</p>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
