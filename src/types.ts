/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Profile {
  userId: string;
  name: string;
  avatar: string; // Base64 or Preset avatar name
  bio: string;
  experience: string; // e.g. "Senior Dev (5 years)" or "Self-taught (2 years)"
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  sessionsConducted: number;
  sessionsAttended: number;
  studentsHelped: number;
  averageRating: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string; // e.g., "Programming", "Design", "Marketing"
}

export interface UserSkill {
  userId: string;
  skillName: string;
  type: 'TEACH' | 'LEARN';
}

export interface LearningRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  skill: string;
  topic: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface Session {
  id: string;
  requestId: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar: string;
  skill: string;
  topic: string;
  date: string;
  time: string;
  format: 'ONLINE' | 'OFFLINE';
  googleMeetLink: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  reviewedByLearner: boolean;
  reviewedByMentor: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  revieweeId: string;
  rating: number;
  reviewText: string;
  timestamp: string;
  skill: string;
}

export interface Notification {
  id: string;
  userId: string;
  content: string;
  type: 'REQUEST' | 'ACCEPT' | 'REJECT' | 'SESSION' | 'REVIEW' | 'MESSAGE';
  read: boolean;
  timestamp: string;
}
