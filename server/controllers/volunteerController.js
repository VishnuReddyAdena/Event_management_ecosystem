import { dataHelper } from '../models/dataHelper.js';

export const applyToVolunteer = async (req, res) => {
  try {
    const { eventId, message, skills } = req.body;
    const userId = req.user.id;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    const event = await dataHelper.findById('Event', eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check if already applied or hired
    const existingApp = await dataHelper.findOne('Application', {
      event: eventId,
      user: userId,
      type: 'volunteer'
    });

    if (existingApp) {
      return res.status(400).json({ message: `You have already applied for this event. Status: ${existingApp.status}` });
    }

    const isHired = (event.volunteers || []).some(id => String(id) === String(userId));
    if (isHired) {
      return res.status(400).json({ message: 'You are already a volunteer for this event.' });
    }

    const newApplication = await dataHelper.create('Application', {
      event: eventId,
      user: userId,
      type: 'volunteer',
      status: 'pending',
      details: {
        message: message || '',
        skills: skills || []
      }
    });

    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Apply to volunteer error:', error);
    res.status(500).json({ message: 'Server error during volunteer application.' });
  }
};

export const getApplications = async (req, res) => {
  try {
    const applications = await dataHelper.find('Application', { type: req.query.type || 'volunteer' });
    const events = await dataHelper.find('Event');
    const users = await dataHelper.find('User');

    // Enrich applications
    const enriched = applications.map(app => {
      const event = events.find(e => String(e._id) === String(app.event));
      const user = users.find(u => String(u._id) === String(app.user));
      
      const userClean = user ? { _id: user._id, name: user.name, email: user.email, profile: user.profile } : null;
      const eventClean = event ? { _id: event._id, title: event.title, organizer: event.organizer } : null;
      
      return {
        ...app,
        user: userClean,
        event: eventClean
      };
    });

    // Filter by organizer if needed
    if (req.user.role === 'organizer') {
      const filtered = enriched.filter(app => app.event && String(app.event.organizer) === String(req.user.id));
      return res.status(200).json(filtered);
    }

    res.status(200).json(enriched);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error retrieving applications.' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Choose approved or rejected.' });
    }

    const application = await dataHelper.findById('Application', id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const event = await dataHelper.findById('Event', application.event);
    if (!event) {
      return res.status(404).json({ message: 'Associated event not found.' });
    }

    // Verify organizer permission
    if (String(event.organizer) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized. Only the event organizer can review applications.' });
    }

    // Update status
    const updatedApp = await dataHelper.findByIdAndUpdate('Application', id, { status });

    // If volunteer is approved, add them to the event volunteers list
    if (status === 'approved') {
      if (application.type === 'volunteer') {
        const isAlreadyVolunteer = (event.volunteers || []).some(vId => String(vId) === String(application.user));
        if (!isAlreadyVolunteer) {
          await dataHelper.findByIdAndUpdate('Event', application.event, {
            $push: { volunteers: application.user }
          });
        }
      } else if (application.type === 'sponsor') {
        // Find packages and mark the selected package as sold and link the sponsor user
        const packageId = application.details?.packageId;
        const sponsorshipPackages = event.sponsorshipPackages.map(pkg => {
          if (String(pkg._id) === String(packageId)) {
            return { ...pkg, sold: true, sponsor: application.user };
          }
          return pkg;
        });

        // Add sponsor cash flow to organizer budget as income
        const soldPackage = event.sponsorshipPackages.find(pkg => String(pkg._id) === String(packageId));
        const price = soldPackage ? soldPackage.price : (application.details?.sponsorAmount || 0);

        const newItems = [...(event.budget?.items || []), {
          description: `Sponsorship Package Sold (${soldPackage?.name || 'Custom'})`,
          amount: price,
          type: 'income'
        }];

        await dataHelper.findByIdAndUpdate('Event', application.event, {
          $set: {
            sponsorshipPackages,
            'budget.income': Number(event.budget?.income || 0) + price,
            'budget.items': newItems
          }
        });
      }
    }

    res.status(200).json(updatedApp);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error updating application status.' });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID parameter is required.' });
    }

    const tasks = await dataHelper.find('Task', { eventId });
    const users = await dataHelper.find('User');

    // Enrich tasks with assigned user data
    const enrichedTasks = tasks.map(task => {
      const assignee = users.find(u => String(u._id) === String(task.assignedTo));
      return {
        ...task,
        assignedToUser: assignee ? { _id: assignee._id, name: assignee.name, email: assignee.email } : null
      };
    });

    res.status(200).json(enrichedTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error retrieving tasks.' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, eventId } = req.body;

    if (!title || !eventId) {
      return res.status(400).json({ message: 'Title and Event ID are required.' });
    }

    const event = await dataHelper.findById('Event', eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Get number of existing tasks to set order
    const existing = await dataHelper.find('Task', { eventId });
    const maxOrder = existing.reduce((max, t) => Math.max(max, t.order || 0), 0);

    const newTask = await dataHelper.create('Task', {
      eventId,
      title,
      description: description || '',
      status: 'todo',
      assignedTo: assignedTo || null,
      order: maxOrder + 1000,
      pointValue: 15
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task.' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, destinationIndex } = req.body; // status: 'todo', 'inProgress', 'done'
    const destinationStatus = status || 'todo';
    const targetIdx = destinationIndex !== undefined ? Number(destinationIndex) : 0;

    if (!['todo', 'inProgress', 'done'].includes(destinationStatus)) {
      return res.status(400).json({ message: 'Invalid status parameter. Choose: todo, inProgress, done' });
    }

    const task = await dataHelper.findById('Task', id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const eventId = task.eventId || task.event;

    // Calculate midpoint task sorting order to prevent bulk shifting
    const tasksInColumn = await dataHelper.find('Task', { eventId, status: destinationStatus });
    tasksInColumn.sort((a, b) => (a.order || 0) - (b.order || 0));

    let calculatedNewOrder = 1000;
    if (tasksInColumn.length === 0) {
      calculatedNewOrder = 1000;
    } else if (targetIdx === 0) {
      calculatedNewOrder = (tasksInColumn[0].order || 1000) / 2;
    } else if (targetIdx >= tasksInColumn.length) {
      calculatedNewOrder = (tasksInColumn[tasksInColumn.length - 1].order || 1000) + 1000;
    } else {
      calculatedNewOrder = ((tasksInColumn[targetIdx - 1].order || 0) + (tasksInColumn[targetIdx].order || 0)) / 2;
    }

    const prevStatus = task.status;
    const updatedTask = await dataHelper.findByIdAndUpdate('Task', id, {
      $set: { status: destinationStatus, order: calculatedNewOrder }
    });

    // Reward points inside volunteerProfile if task is moved to completed ('done')
    if (destinationStatus === 'done' && prevStatus !== 'done' && task.assignedTo) {
      const volunteer = await dataHelper.findById('User', task.assignedTo);
      if (volunteer) {
        const pointVal = task.pointValue || 15;
        const currentScore = (volunteer.volunteerProfile?.performanceScore || 0) + pointVal;
        const achievements = [...(volunteer.volunteerProfile?.achievements || [])];
        
        if (currentScore >= 30 && !achievements.includes('Bronze Organizer Helper')) {
          achievements.push('Bronze Organizer Helper');
        }
        if (currentScore >= 60 && !achievements.includes('Silver Task Crusher')) {
          achievements.push('Silver Task Crusher');
        }
        if (currentScore >= 100 && !achievements.includes('Gold Lead Volunteer')) {
          achievements.push('Gold Lead Volunteer');
        }

        await dataHelper.findByIdAndUpdate('User', task.assignedTo, {
          $set: {
            'volunteerProfile.performanceScore': currentScore,
            'volunteerProfile.achievements': achievements
          }
        });
      }
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error updating task status.' });
  }
};

export const getVolunteerLeaderboard = async (req, res) => {
  try {
    const users = await dataHelper.find('User', { role: 'volunteer' });
    
    // Sort volunteers by points (descending) then performanceScore (descending)
    const sorted = users
      .map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        points: u.profile?.points || 0,
        performanceScore: u.profile?.performanceScore || 100,
        skills: u.profile?.skills || [],
        badges: u.profile?.badges || []
      }))
      .sort((a, b) => b.points - a.points || b.performanceScore - a.performanceScore);

    res.status(200).json(sorted);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error retrieving leaderboard.' });
  }
};
