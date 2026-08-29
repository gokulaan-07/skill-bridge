/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { 
  User, Profile, LearningRequest, Session, Message, Review, Notification, UserSkill 
} from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Set up simple local database
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> password (stored simply for sandbox)
  profiles: Record<string, Profile>;
  userSkills: UserSkill[];
  requests: LearningRequest[];
  sessions: Session[];
  messages: Message[];
  reviews: Review[];
  notifications: Notification[];
  activeSessions: Record<string, string>; // token -> userId
}

// Ensure database directories and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialDb: DatabaseSchema = {
  users: [
    { id: 'u-gokul', email: 'gokul@skillbridge.com', role: 'USER', createdAt: new Date().toISOString() },
    { id: 'u-priya', email: 'priya@skillbridge.com', role: 'USER', createdAt: new Date().toISOString() },
    { id: 'u-alex', email: 'alex@skillbridge.com', role: 'USER', createdAt: new Date().toISOString() },
    { id: 'u-sarah', email: 'sarah@skillbridge.com', role: 'USER', createdAt: new Date().toISOString() },
    { id: 'u-admin', email: 'admin@skillbridge.com', role: 'ADMIN', createdAt: new Date().toISOString() },
  ],
  passwords: {
    'u-gokul': 'gokul123',
    'u-priya': 'priya123',
    'u-alex': 'alex123',
    'u-sarah': 'sarah123',
    'u-admin': 'admin123',
  },
  profiles: {
    'u-gokul': {
      userId: 'u-gokul',
      name: 'Gokul Ramasamy',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      bio: 'Full Stack Java Engineer with a passion for building microservices. Looking to expand my skillset in modern React and frontend architectures to build cohesive user interfaces.',
      experience: 'Senior Java Developer at TechCorp (5 years)',
      location: 'Bengaluru, India',
      linkedin: 'linkedin.com/in/gokul-ramasamy',
      github: 'github.com/gokul-dev',
      portfolio: 'gokul.dev',
      sessionsConducted: 14,
      sessionsAttended: 8,
      studentsHelped: 12,
      averageRating: 4.8,
    },
    'u-priya': {
      userId: 'u-priya',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      bio: 'Frontend Specialist & UI Designer. I craft responsive, high-performance user interfaces and design visuals. Currently diving into python backend systems for automation.',
      experience: 'Lead UI Engineer at DesignStudio (4 years)',
      location: 'Mumbai, India',
      linkedin: 'linkedin.com/in/priya-design',
      github: 'github.com/priya-ui',
      portfolio: 'priyasharma.design',
      sessionsConducted: 22,
      sessionsAttended: 15,
      studentsHelped: 19,
      averageRating: 4.9,
    },
    'u-alex': {
      userId: 'u-alex',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      bio: 'Data Scientist turned ML Engineer. I have built multiple production NLP systems. I want to learn Photoshop and vector design to improve my slide decks and content creation.',
      experience: 'Data Scientist at AI Labs (3 years)',
      location: 'San Francisco, USA',
      linkedin: 'linkedin.com/in/alex-rivera-data',
      github: 'github.com/alex-ml',
      portfolio: 'alexrivera.ai',
      sessionsConducted: 8,
      sessionsAttended: 12,
      studentsHelped: 6,
      averageRating: 4.7,
    },
    'u-sarah': {
      userId: 'u-sarah',
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      bio: 'Marketing Lead & Growth Hacker. Specialized in SEO, SEM, and brand design. Looking to learn basic HTML/CSS and Webflow to build campaign landing pages faster.',
      experience: 'Growth Lead at SaaSify (6 years)',
      location: 'London, UK',
      linkedin: 'linkedin.com/in/sarah-jenkins-growth',
      github: 'github.com/sarah-growth',
      portfolio: 'sarahjenkins.co',
      sessionsConducted: 18,
      sessionsAttended: 4,
      studentsHelped: 15,
      averageRating: 4.6,
    },
    'u-admin': {
      userId: 'u-admin',
      name: 'Platform Administrator',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      bio: 'SkillBridge Community Manager and Support Coordinator.',
      experience: 'SkillBridge Admin Team',
      location: 'Global Support',
      linkedin: '',
      github: '',
      portfolio: '',
      sessionsConducted: 0,
      sessionsAttended: 0,
      studentsHelped: 0,
      averageRating: 5.0,
    }
  },
  userSkills: [
    // Gokul
    { userId: 'u-gokul', skillName: 'Java', type: 'TEACH' },
    { userId: 'u-gokul', skillName: 'Spring Boot', type: 'TEACH' },
    { userId: 'u-gokul', skillName: 'React', type: 'LEARN' },
    { userId: 'u-gokul', skillName: 'UI/UX', type: 'LEARN' },
    
    // Priya
    { userId: 'u-priya', skillName: 'React', type: 'TEACH' },
    { userId: 'u-priya', skillName: 'Photoshop', type: 'TEACH' },
    { userId: 'u-priya', skillName: 'Python', type: 'LEARN' },
    
    // Alex
    { userId: 'u-alex', skillName: 'Python', type: 'TEACH' },
    { userId: 'u-alex', skillName: 'Machine Learning', type: 'TEACH' },
    { userId: 'u-alex', skillName: 'Photoshop', type: 'LEARN' },
    
    // Sarah
    { userId: 'u-sarah', skillName: 'SEO', type: 'TEACH' },
    { userId: 'u-sarah', skillName: 'Growth Marketing', type: 'TEACH' },
    { userId: 'u-sarah', skillName: 'React', type: 'LEARN' },
  ],
  requests: [
    {
      id: 'req-1',
      senderId: 'u-gokul',
      senderName: 'Gokul Ramasamy',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      receiverId: 'u-priya',
      receiverName: 'Priya Sharma',
      receiverAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      skill: 'React',
      topic: 'React Hooks and State Management with Context API',
      preferredDate: '2026-07-20',
      preferredTime: '15:00',
      description: 'Hi Priya, I saw you specialize in frontend architectures. I am trying to build a clean dashboard and want to master React Hooks and state management. Looking forward to learning from you!',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'req-2',
      senderId: 'u-priya',
      senderName: 'Priya Sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      receiverId: 'u-alex',
      receiverName: 'Alex Rivera',
      receiverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      skill: 'Python',
      topic: 'Introduction to Pandas and API endpoints with FastAPI',
      preferredDate: '2026-07-22',
      preferredTime: '10:00',
      description: 'Hi Alex, I need some help in python data engineering to format backend configurations for a new dashboard. Let me know if we can sync up!',
      status: 'ACCEPTED',
      createdAt: new Date().toISOString(),
    }
  ],
  sessions: [
    {
      id: 'sess-1',
      requestId: 'req-2',
      mentorId: 'u-alex',
      mentorName: 'Alex Rivera',
      mentorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      learnerId: 'u-priya',
      learnerName: 'Priya Sharma',
      learnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      skill: 'Python',
      topic: 'Introduction to Pandas and API endpoints with FastAPI',
      date: '2026-07-22',
      time: '10:00',
      format: 'ONLINE',
      googleMeetLink: 'https://meet.google.com/abc-defg-hij',
      status: 'SCHEDULED',
      reviewedByLearner: false,
      reviewedByMentor: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sess-completed',
      requestId: 'req-old',
      mentorId: 'u-priya',
      mentorName: 'Priya Sharma',
      mentorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      learnerId: 'u-sarah',
      learnerName: 'Sarah Jenkins',
      learnerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      skill: 'React',
      topic: 'JSX Basics and Tailwind CSS Setup',
      date: '2026-07-10',
      time: '14:00',
      format: 'ONLINE',
      googleMeetLink: 'https://meet.google.com/xyz-mno-pqr',
      status: 'COMPLETED',
      reviewedByLearner: true,
      reviewedByMentor: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ],
  messages: [
    { id: 'm-1', senderId: 'u-priya', receiverId: 'u-gokul', content: 'Hey Gokul! Thanks for connecting. I saw you want to learn React, and I really need help with Spring Boot. Let us set up a swap!', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'm-2', senderId: 'u-gokul', receiverId: 'u-priya', content: 'Absolutely Priya! That would be fantastic. I am free this weekend. Spring Boot is my specialty, I can teach you MVC, JPA, and security.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: 'm-3', senderId: 'u-priya', receiverId: 'u-gokul', content: 'Perfect! I will review your request and schedule a meeting.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  ],
  reviews: [
    {
      id: 'rev-1',
      sessionId: 'sess-completed',
      reviewerId: 'u-sarah',
      reviewerName: 'Sarah Jenkins',
      reviewerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      revieweeId: 'u-priya',
      rating: 5,
      reviewText: 'Priya is an incredible mentor! She explained React components and Tailwind styling so clearly. I can already start editing landing pages on my own now.',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      skill: 'React'
    }
  ],
  notifications: [
    {
      id: 'nt-1',
      userId: 'u-priya',
      content: 'Gokul Ramasamy sent you a learning request for React.',
      type: 'REQUEST',
      read: false,
      timestamp: new Date().toISOString()
    },
    {
      id: 'nt-2',
      userId: 'u-priya',
      content: 'Your scheduled session with Alex Rivera is coming up on July 22.',
      type: 'SESSION',
      read: false,
      timestamp: new Date().toISOString()
    }
  ],
  activeSessions: {},
};

// Database load and save helpers
function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load database. Re-initializing with seed data.', error);
  }
  // Store initial database
  saveDb(initialDb);
  return initialDb;
}

function saveDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database:', error);
  }
}

// Initialize database
let db = loadDb();

// Express JSON body parser
app.use(express.json({ limit: '10mb' }));

// Helper Middleware: Authenticate with Bearer Token
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const userId = db.activeSessions[token];
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
  // Find user
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: User not found' });
    return;
  }
  (req as any).user = user;
  next();
}

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------

// REGISTER
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, canTeach, wantsToLearn } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Email, Password, and Name are required fields.' });
    return;
  }

  // Check if user exists
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    res.status(400).json({ error: 'Email is already registered.' });
    return;
  }

  const userId = 'u-' + Math.random().toString(36).substring(2, 11);
  const newUser: User = {
    id: userId,
    email: email.toLowerCase(),
    role: 'USER',
    createdAt: new Date().toISOString()
  };

  const newProfile: Profile = {
    userId,
    name,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', // Default placeholder
    bio: 'Newly registered SkillBridge community member. Ready to learn and teach!',
    experience: 'New Member',
    location: 'Global',
    linkedin: '',
    github: '',
    portfolio: '',
    sessionsConducted: 0,
    sessionsAttended: 0,
    studentsHelped: 0,
    averageRating: 5.0,
  };

  // Add initial teaching/learning skills
  const newSkills: UserSkill[] = [];
  if (Array.isArray(canTeach)) {
    canTeach.forEach((skill: string) => {
      newSkills.push({ userId, skillName: skill, type: 'TEACH' });
    });
  }
  if (Array.isArray(wantsToLearn)) {
    wantsToLearn.forEach((skill: string) => {
      newSkills.push({ userId, skillName: skill, type: 'LEARN' });
    });
  }

  // Update Database
  db.users.push(newUser);
  db.passwords[userId] = password;
  db.profiles[userId] = newProfile;
  db.userSkills.push(...newSkills);

  // Generate Session Token
  const token = 'tok-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  db.activeSessions[token] = userId;

  saveDb(db);

  res.status(201).json({
    token,
    user: newUser,
    profile: newProfile,
    skills: newSkills
  });
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const savedPassword = db.passwords[user.id];
  if (savedPassword !== password) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  // Generate Session Token
  const token = 'tok-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  db.activeSessions[token] = user.id;

  saveDb(db);

  const profile = db.profiles[user.id];
  const skills = db.userSkills.filter(s => s.userId === user.id);

  res.json({
    token,
    user,
    profile,
    skills
  });
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    delete db.activeSessions[token];
    saveDb(db);
  }
  res.json({ success: true });
});

// GET CURRENT USER PROFILE
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  const profile = db.profiles[user.id];
  const skills = db.userSkills.filter(s => s.userId === user.id);
  res.json({
    user,
    profile,
    skills
  });
});

// -------------------------------------------------------------
// USER & PROFILE ENDPOINTS
// -------------------------------------------------------------

// GET ALL USERS (WITH OPTIONAL SEARCH PARAMS)
app.get('/api/users', authMiddleware, (req, res) => {
  const currentUser = (req as any).user as User;
  const { query, type, skill } = req.query;

  let filteredUsers = db.users.filter(u => u.id !== currentUser.id && u.role !== 'ADMIN');

  let results = filteredUsers.map(u => {
    const profile = db.profiles[u.id];
    const skills = db.userSkills.filter(s => s.userId === u.id);
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      profile,
      skills
    };
  });

  // Apply search filtering
  if (query) {
    const lowerQuery = String(query).toLowerCase();
    results = results.filter(item => {
      const matchName = item.profile?.name?.toLowerCase().includes(lowerQuery);
      const matchBio = item.profile?.bio?.toLowerCase().includes(lowerQuery);
      const matchExp = item.profile?.experience?.toLowerCase().includes(lowerQuery);
      const matchLoc = item.profile?.location?.toLowerCase().includes(lowerQuery);
      const matchSkills = item.skills.some(s => s.skillName.toLowerCase().includes(lowerQuery));
      return matchName || matchBio || matchExp || matchLoc || matchSkills;
    });
  }

  if (skill) {
    const lowerSkill = String(skill).toLowerCase();
    results = results.filter(item => {
      return item.skills.some(s => s.skillName.toLowerCase() === lowerSkill);
    });
  }

  res.json(results);
});

// GET SPECIFIC USER PROFILE & THEIR REVIEWS
app.get('/api/users/:id', authMiddleware, (req, res) => {
  const targetId = req.params.id;
  const user = db.users.find(u => u.id === targetId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const profile = db.profiles[targetId];
  const skills = db.userSkills.filter(s => s.userId === targetId);
  const reviews = db.reviews.filter(r => r.revieweeId === targetId);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    profile,
    skills,
    reviews
  });
});

// UPDATE USER PROFILE AND SKILLS
app.put('/api/profile', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  const { 
    name, avatar, bio, experience, location, linkedin, github, portfolio, canTeach, wantsToLearn 
  } = req.body;

  if (!db.profiles[user.id]) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  // Update profile attributes
  const profile = db.profiles[user.id];
  if (name) profile.name = name;
  if (avatar) profile.avatar = avatar;
  if (bio !== undefined) profile.bio = bio;
  if (experience !== undefined) profile.experience = experience;
  if (location !== undefined) profile.location = location;
  if (linkedin !== undefined) profile.linkedin = linkedin;
  if (github !== undefined) profile.github = github;
  if (portfolio !== undefined) profile.portfolio = portfolio;

  // Re-build skills list
  if (canTeach || wantsToLearn) {
    // Clear old skills
    db.userSkills = db.userSkills.filter(s => s.userId !== user.id);

    if (Array.isArray(canTeach)) {
      canTeach.forEach(s => {
        db.userSkills.push({ userId: user.id, skillName: s, type: 'TEACH' });
      });
    }

    if (Array.isArray(wantsToLearn)) {
      wantsToLearn.forEach(s => {
        db.userSkills.push({ userId: user.id, skillName: s, type: 'LEARN' });
      });
    }
  }

  saveDb(db);

  res.json({
    success: true,
    profile,
    skills: db.userSkills.filter(s => s.userId === user.id)
  });
});

// GET LIST OF ALL UNIQUE SKILLS (FOR COMPONENT DROPDOWNS & CHIPS)
app.get('/api/skills', (req, res) => {
  const uniqueSkillsSet = new Set<string>();
  db.userSkills.forEach(us => uniqueSkillsSet.add(us.skillName));
  
  // Guarantee some standard standard skills
  const defaultSkills = [
    'React', 'Java', 'Spring Boot', 'Python', 'Photoshop', 'UI/UX', 'SEO', 
    'Growth Marketing', 'Node.js', 'Typescript', 'SQL', 'FastAPI', 'Figma'
  ];
  defaultSkills.forEach(s => uniqueSkillsSet.add(s));

  res.json(Array.from(uniqueSkillsSet));
});

// -------------------------------------------------------------
// REQUESTS & SESSION ENDPOINTS
// -------------------------------------------------------------

// CREATE LEARNING REQUEST
app.post('/api/requests', authMiddleware, (req, res) => {
  const sender = (req as any).user as User;
  const { receiverId, skill, topic, preferredDate, preferredTime, description } = req.body;

  if (!receiverId || !skill || !topic || !preferredDate || !preferredTime) {
    res.status(400).json({ error: 'Missing required request fields' });
    return;
  }

  const receiver = db.users.find(u => u.id === receiverId);
  if (!receiver) {
    res.status(404).json({ error: 'Recipient user not found' });
    return;
  }

  const senderProfile = db.profiles[sender.id];
  const receiverProfile = db.profiles[receiverId];

  const newRequest: LearningRequest = {
    id: 'req-' + Math.random().toString(36).substring(2, 11),
    senderId: sender.id,
    senderName: senderProfile?.name || 'User',
    senderAvatar: senderProfile?.avatar || '',
    receiverId: receiverId,
    receiverName: receiverProfile?.name || 'User',
    receiverAvatar: receiverProfile?.avatar || '',
    skill,
    topic,
    preferredDate,
    preferredTime,
    description,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  db.requests.push(newRequest);

  // Send real-time notification to receiver
  db.notifications.push({
    id: 'nt-' + Math.random().toString(36).substring(2, 11),
    userId: receiverId,
    content: `${senderProfile?.name || 'Someone'} sent you a learning request for "${skill}".`,
    type: 'REQUEST',
    read: false,
    timestamp: new Date().toISOString()
  });

  saveDb(db);

  res.status(201).json(newRequest);
});

// GET REQUESTS
app.get('/api/requests', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  // Get requests where user is sender OR receiver
  const userRequests = db.requests.filter(r => r.senderId === user.id || r.receiverId === user.id);
  res.json(userRequests);
});

// RESPOND TO A REQUEST (ACCEPT / REJECT / CANCEL)
app.post('/api/requests/:id/respond', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  const { action } = req.body; // 'ACCEPT', 'REJECT', 'CANCEL'
  const reqId = req.params.id;

  const request = db.requests.find(r => r.id === reqId);
  if (!request) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }

  // Permissions validation
  if (action === 'CANCEL' && request.senderId !== user.id) {
    res.status(403).json({ error: 'Only the sender can cancel a request' });
    return;
  }
  if ((action === 'ACCEPT' || action === 'REJECT') && request.receiverId !== user.id) {
    res.status(403).json({ error: 'Only the recipient can accept or reject a request' });
    return;
  }

  if (action === 'CANCEL') {
    request.status = 'CANCELLED';
  } else if (action === 'REJECT') {
    request.status = 'REJECTED';
    // Notify sender
    db.notifications.push({
      id: 'nt-' + Math.random().toString(36).substring(2, 11),
      userId: request.senderId,
      content: `${db.profiles[user.id]?.name} declined your learning request for "${request.skill}".`,
      type: 'REJECT',
      read: false,
      timestamp: new Date().toISOString()
    });
  } else if (action === 'ACCEPT') {
    request.status = 'ACCEPTED';

    // Auto-create scheduled mentoring session!
    const mentorProfile = db.profiles[request.receiverId];
    const learnerProfile = db.profiles[request.senderId];

    const sessionMeetLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

    const newSession: Session = {
      id: 'sess-' + Math.random().toString(36).substring(2, 11),
      requestId: request.id,
      mentorId: request.receiverId,
      mentorName: mentorProfile?.name || 'Mentor',
      mentorAvatar: mentorProfile?.avatar || '',
      learnerId: request.senderId,
      learnerName: learnerProfile?.name || 'Learner',
      learnerAvatar: learnerProfile?.avatar || '',
      skill: request.skill,
      topic: request.topic,
      date: request.preferredDate,
      time: request.preferredTime,
      format: 'ONLINE',
      googleMeetLink: sessionMeetLink,
      status: 'SCHEDULED',
      reviewedByLearner: false,
      reviewedByMentor: false,
      createdAt: new Date().toISOString()
    };

    db.sessions.push(newSession);

    // Notify sender of Acceptance
    db.notifications.push({
      id: 'nt-' + Math.random().toString(36).substring(2, 11),
      userId: request.senderId,
      content: `${mentorProfile?.name} accepted your request for "${request.skill}". Session scheduled!`,
      type: 'ACCEPT',
      read: false,
      timestamp: new Date().toISOString()
    });
  }

  saveDb(db);
  res.json({ success: true, request });
});

// GET SESSIONS
app.get('/api/sessions', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  const userSessions = db.sessions.filter(s => s.mentorId === user.id || s.learnerId === user.id);
  res.json(userSessions);
});

// COMPLETE A SESSION
app.post('/api/sessions/:id/complete', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  const sessId = req.params.id;

  const session = db.sessions.find(s => s.id === sessId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  // Only participants can complete
  if (session.mentorId !== user.id && session.learnerId !== user.id) {
    res.status(403).json({ error: 'Forbidden: You are not a participant in this session' });
    return;
  }

  session.status = 'COMPLETED';

  // Update profile metrics automatically!
  const mentorProfile = db.profiles[session.mentorId];
  const learnerProfile = db.profiles[session.learnerId];

  if (mentorProfile) {
    mentorProfile.sessionsConducted += 1;
    // Set unique student helper count
    const uniqueStudents = new Set(
      db.sessions
        .filter(s => s.mentorId === session.mentorId && s.status === 'COMPLETED')
        .map(s => s.learnerId)
    );
    mentorProfile.studentsHelped = uniqueStudents.size;
  }

  if (learnerProfile) {
    learnerProfile.sessionsAttended += 1;
  }

  // Notify both
  db.notifications.push({
    id: 'nt-' + Math.random().toString(36).substring(2, 11),
    userId: session.learnerId,
    content: `Your mentoring session with ${mentorProfile?.name} has been marked COMPLETED. Please leave a review!`,
    type: 'REVIEW',
    read: false,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, session });
});

// SUBMIT RATING & REVIEW FOR SESS
app.post('/api/sessions/:id/review', authMiddleware, (req, res) => {
  const reviewer = (req as any).user as User;
  const sessId = req.params.id;
  const { rating, reviewText } = req.body;

  if (!rating || !reviewText) {
    res.status(400).json({ error: 'Rating and Review text are required' });
    return;
  }

  const session = db.sessions.find(s => s.id === sessId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  if (session.status !== 'COMPLETED') {
    res.status(400).json({ error: 'Reviews can only be written for COMPLETED sessions' });
    return;
  }

  let revieweeId = '';
  if (session.learnerId === reviewer.id) {
    revieweeId = session.mentorId;
    session.reviewedByLearner = true;
  } else if (session.mentorId === reviewer.id) {
    revieweeId = session.learnerId;
    session.reviewedByMentor = true;
  } else {
    res.status(403).json({ error: 'You are not a participant in this session' });
    return;
  }

  const reviewerProfile = db.profiles[reviewer.id];

  const newReview: Review = {
    id: 'rev-' + Math.random().toString(36).substring(2, 11),
    sessionId: session.id,
    reviewerId: reviewer.id,
    reviewerName: reviewerProfile?.name || 'Reviewer',
    reviewerAvatar: reviewerProfile?.avatar || '',
    revieweeId,
    rating: Number(rating),
    reviewText,
    timestamp: new Date().toISOString(),
    skill: session.skill
  };

  db.reviews.push(newReview);

  // Re-calculate average rating for the reviewee
  const targetProfile = db.profiles[revieweeId];
  if (targetProfile) {
    const allReviewsForUser = db.reviews.filter(r => r.revieweeId === revieweeId);
    const sum = allReviewsForUser.reduce((acc, curr) => acc + curr.rating, 0);
    targetProfile.averageRating = Number((sum / allReviewsForUser.length).toFixed(1));
  }

  // Notify reviewee
  db.notifications.push({
    id: 'nt-' + Math.random().toString(36).substring(2, 11),
    userId: revieweeId,
    content: `New ${rating}-star review received from ${reviewerProfile?.name || 'a peer'}!`,
    type: 'REVIEW',
    read: false,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, review: newReview, session });
});

// -------------------------------------------------------------
// CHAT ENDPOINTS
// -------------------------------------------------------------

// GET MESSAGES BETWEEN ME AND ANOTHER USER
app.get('/api/chat/:userId', authMiddleware, (req, res) => {
  const me = (req as any).user as User;
  const otherId = req.params.userId;

  const chatMessages = db.messages.filter(
    m => (m.senderId === me.id && m.receiverId === otherId) || 
         (m.senderId === otherId && m.receiverId === me.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  res.json(chatMessages);
});

// SEND MESSAGE
app.post('/api/chat', authMiddleware, (req, res) => {
  const sender = (req as any).user as User;
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    res.status(400).json({ error: 'Receiver ID and content are required' });
    return;
  }

  const newMessage: Message = {
    id: 'm-' + Math.random().toString(36).substring(2, 11),
    senderId: sender.id,
    receiverId,
    content,
    timestamp: new Date().toISOString()
  };

  db.messages.push(newMessage);

  // Send light-weight notification
  db.notifications.push({
    id: 'nt-' + Math.random().toString(36).substring(2, 11),
    userId: receiverId,
    content: `New message from ${db.profiles[sender.id]?.name || 'a peer'}: "${content.substring(0, 30)}..."`,
    type: 'MESSAGE',
    read: false,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.status(201).json(newMessage);
});

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------

// GET NOTIFICATIONS
app.get('/api/notifications', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  const list = db.notifications
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(list);
});

// MARK NOTIFICATION READ
app.post('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  const notif = db.notifications.find(n => n.id === req.params.id && n.userId === user.id);
  if (notif) {
    notif.read = true;
    saveDb(db);
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// ADMIN DASHBOARD & FEATURES
// -------------------------------------------------------------

// ADMIN OVERVIEW ANALYTICS
app.get('/api/admin/analytics', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access Denied: Admins Only' });
    return;
  }

  const totalUsers = db.users.filter(u => u.role !== 'ADMIN').length;
  const totalSessions = db.sessions.length;
  const activeSessions = db.sessions.filter(s => s.status === 'SCHEDULED').length;
  const completedSessions = db.sessions.filter(s => s.status === 'COMPLETED').length;
  const totalReviews = db.reviews.length;

  // Most popular skills teaching
  const skillsCount: Record<string, number> = {};
  db.userSkills.forEach(us => {
    if (us.type === 'TEACH') {
      skillsCount[us.skillName] = (skillsCount[us.skillName] || 0) + 1;
    }
  });

  const popularSkills = Object.entries(skillsCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  res.json({
    totalUsers,
    totalSessions,
    activeSessions,
    completedSessions,
    totalReviews,
    popularSkills
  });
});

// ADMIN MANAGE USERS
app.get('/api/admin/users', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access Denied: Admins Only' });
    return;
  }

  const list = db.users.map(u => {
    const profile = db.profiles[u.id];
    const skills = db.userSkills.filter(s => s.userId === u.id);
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      profile,
      skills
    };
  });

  res.json(list);
});

// ADMIN REMOVE USER (FAKE ACCOUNTS)
app.delete('/api/admin/users/:id', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access Denied: Admins Only' });
    return;
  }

  const targetId = req.params.id;
  if (targetId === user.id) {
    res.status(400).json({ error: 'Cannot delete yourself' });
    return;
  }

  db.users = db.users.filter(u => u.id !== targetId);
  delete db.profiles[targetId];
  delete db.passwords[targetId];
  db.userSkills = db.userSkills.filter(s => s.userId !== targetId);
  db.requests = db.requests.filter(r => r.senderId !== targetId && r.receiverId !== targetId);
  db.sessions = db.sessions.filter(s => s.mentorId !== targetId && s.learnerId !== targetId);
  db.messages = db.messages.filter(m => m.senderId !== targetId && m.receiverId !== targetId);
  db.reviews = db.reviews.filter(r => r.reviewerId !== targetId && r.revieweeId !== targetId);
  db.notifications = db.notifications.filter(n => n.userId !== targetId);

  saveDb(db);

  res.json({ success: true });
});

// ADMIN VIEW ALL SESSIONS
app.get('/api/admin/sessions', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access Denied: Admins Only' });
    return;
  }
  res.json(db.sessions);
});

// ADMIN VIEW ALL FEEDBACK
app.get('/api/admin/feedback', authMiddleware, (req, res) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access Denied: Admins Only' });
    return;
  }
  res.json(db.reviews);
});

// -------------------------------------------------------------
// VITE DEV / PRODUCTION HANDLERS
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SkillBridge] Server booting... Listening on http://localhost:${PORT}`);
  });
}

startServer();
