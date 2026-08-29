/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Award, BookOpen, Calendar, HelpCircle, MessageSquare, Plus, ArrowRight, Check, X, MapPin, ExternalLink, Star 
} from 'lucide-react';
import { User, Profile, LearningRequest, Session, Notification } from '../types';

interface DashboardProps {
  user: User;
  profile: Profile;
  skills: any[];
  requests: LearningRequest[];
  sessions: Session[];
  notifications: Notification[];
  onNavigate: (view: string, targetUserId?: string) => void;
  onRespondToRequest: (id: string, action: 'ACCEPT' | 'REJECT' | 'CANCEL') => void;
}

export default function Dashboard({
  user,
  profile,
  skills,
  requests,
  sessions,
  notifications,
  onNavigate,
  onRespondToRequest
}: DashboardProps) {
  
  // Separate skills
  const teachingSkills = skills.filter(s => s.type === 'TEACH').map(s => s.skillName);
  const learningSkills = skills.filter(s => s.type === 'LEARN').map(s => s.skillName);

  // Filter requests involving me as recipient
  const incomingRequests = requests.filter(r => r.receiverId === user.id && r.status === 'PENDING');
  // Filter requests involving me as sender
  const outgoingRequests = requests.filter(r => r.senderId === user.id && r.status === 'PENDING');

  // Filter sessions involving me
  const activeSessions = sessions.filter(s => s.status === 'SCHEDULED');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="dashboard-container">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 p-6 sm:p-8 text-white border border-slate-800/80 shadow-2xl shadow-black/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-indigo-50/10 ring-4 ring-indigo-500/25">
              <img
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.email}`}
                alt="My profile pic"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-sans text-2xl font-bold tracking-tight">{profile.name}</h1>
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-2xs font-bold text-indigo-300 uppercase tracking-wider">
                  Member
                </span>
              </div>
              <p className="font-sans text-xs text-slate-300 max-w-xl mt-1.5 line-clamp-2">
                {profile.bio || 'Add a bio to tell the community who you are and what your goals are.'}
              </p>
              <div className="flex items-center space-x-3.5 text-2xs text-slate-400 mt-2">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{profile.location || 'Global'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-300">{profile.averageRating} Rating</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onNavigate('search')}
              className="flex-1 sm:flex-initial rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white hover:bg-indigo-500 transition flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-950/40"
              id="dash-search-shortcut-btn"
            >
              <span>Search Skills</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('profile', user.id)}
              className="flex-1 sm:flex-initial rounded-xl bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-750 transition border border-slate-700/50"
              id="dash-edit-profile-btn"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" id="dash-metrics-grid">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-md">
          <span className="block text-2xs font-bold text-slate-400 uppercase tracking-wider">Sessions Conducted</span>
          <span className="mt-2 block text-3xl font-bold text-slate-100">{profile.sessionsConducted}</span>
          <span className="text-[10px] text-slate-500">As a mentor helping others</span>
        </div>
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-md">
          <span className="block text-2xs font-bold text-slate-400 uppercase tracking-wider">Sessions Attended</span>
          <span className="mt-2 block text-3xl font-bold text-slate-100">{profile.sessionsAttended}</span>
          <span className="text-[10px] text-slate-500">As a learner swapping skills</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-md">
          <span className="block text-2xs font-bold text-slate-400 uppercase tracking-wider">Average Swap Rating</span>
          <span className="mt-2 block text-3xl font-bold text-slate-100 flex items-center space-x-1">
            <span>{profile.averageRating}</span>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </span>
          <span className="text-[10px] text-slate-500">Based on peer reviews</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-md">
          <span className="block text-2xs font-bold text-slate-400 uppercase tracking-wider">Students Helped</span>
          <span className="mt-2 block text-3xl font-bold text-slate-100">{profile.studentsHelped}</span>
          <span className="text-[10px] text-slate-500">Unique peers mentored</span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left 2 Columns: Requests and Scheduled Sessions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Learning Swaps Requests */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="font-sans text-base font-bold text-slate-100 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>Learning Requests ({incomingRequests.length})</span>
              </h2>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Incoming swap requests</span>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <p>No pending learning requests from other members.</p>
                <p className="text-[10px] text-slate-600">When someone wants to learn your skill, it will appear here!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {incomingRequests.map(req => (
                  <div key={req.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex items-start justify-between">
                      <div 
                        onClick={() => onNavigate('profile', req.senderId)}
                        className="flex items-center space-x-3 cursor-pointer group"
                      >
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-950">
                          <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${req.senderId}`} alt={req.senderName} className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-200 group-hover:text-indigo-400 leading-none">
                            {req.senderName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Wants to learn <span className="font-semibold text-indigo-400">{req.skill}</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Accept/Reject CTA */}
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => onRespondToRequest(req.id, 'ACCEPT')}
                          className="rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-500/20 p-1.5 hover:bg-indigo-900/45 transition"
                          title="Accept and schedule"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRespondToRequest(req.id, 'REJECT')}
                          className="rounded-lg bg-red-950/60 text-red-400 border border-red-500/20 p-1.5 hover:bg-red-900/45 transition"
                          title="Decline request"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-950 p-3 text-2xs text-slate-300">
                      <p className="font-bold text-slate-100 mb-1">Topic: {req.topic}</p>
                      <p>{req.description}</p>
                      <div className="mt-2 flex items-center space-x-4 font-mono text-[10px] text-slate-500">
                        <span>Preferred: {req.preferredDate}</span>
                        <span>Time: {req.preferredTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Swap Sessions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="font-sans text-base font-bold text-slate-100 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>Upcoming Sessions ({activeSessions.length})</span>
              </h2>
              <button 
                onClick={() => onNavigate('sessions')} 
                className="text-xs font-semibold text-indigo-400 hover:underline"
                id="dash-view-all-sessions"
              >
                View all
              </button>
            </div>

            {activeSessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <p>No upcoming live sessions scheduled.</p>
                <p className="text-[10px] text-slate-600">Accept a request or send a request to schedule a 1-on-1 session!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSessions.map(sess => {
                  const isMentor = sess.mentorId === user.id;
                  const partnerName = isMentor ? sess.learnerName : sess.mentorName;
                  const roleLabel = isMentor ? 'Teaching' : 'Learning';

                  return (
                    <div key={sess.id} className="rounded-xl border border-slate-800 p-4 hover:border-slate-700/80 transition space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            isMentor 
                              ? 'bg-emerald-950/45 border border-emerald-500/10 text-emerald-400' 
                              : 'bg-indigo-950/45 border border-indigo-500/10 text-indigo-400'
                          }`}>
                            {roleLabel}: {sess.skill}
                          </span>
                          <h3 className="font-sans text-xs font-bold text-slate-100 mt-1.5">{sess.topic}</h3>
                          <p className="text-2xs text-slate-400 mt-0.5">With {partnerName}</p>
                        </div>

                        <div className="text-right font-mono text-[10px] text-slate-500">
                          <span className="block font-bold text-slate-300">{sess.date}</span>
                          <span>{sess.time}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800 items-center justify-between">
                        <span className="text-2xs font-mono text-indigo-400 flex items-center space-x-1">
                          <ExternalLink className="w-3 h-3" />
                          <a href={sess.googleMeetLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {sess.googleMeetLink.substring(0, 30)}...
                          </a>
                        </span>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <a
                            href={sess.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none text-center rounded-lg bg-indigo-600 px-3 py-1.5 text-2xs font-bold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-950/40"
                          >
                            Join Meet
                          </a>
                          <button
                            onClick={() => onNavigate('sessions')}
                            className="flex-1 sm:flex-none rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-2xs font-bold text-slate-300 hover:bg-slate-800"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: My Skills Lists & Outgoing status */}
        <div className="space-y-8">
          
          {/* Skills Grid Dashboard */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md space-y-5">
            <div>
              <h2 className="font-sans text-sm font-bold text-slate-100 mb-1">My Skills Profile</h2>
              <p className="text-[10px] text-slate-400">What you can offer and what you are chasing</p>
            </div>

            {/* TEACH */}
            <div>
              <span className="block text-[10px] font-bold text-emerald-450 uppercase tracking-wider mb-2">I Can Teach</span>
              {teachingSkills.length === 0 ? (
                <span className="text-2xs text-slate-500">No teaching skills added.</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {teachingSkills.map((s, i) => (
                    <span key={i} className="rounded-full bg-emerald-950/45 border border-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* LEARN */}
            <div>
              <span className="block text-[10px] font-bold text-indigo-450 uppercase tracking-wider mb-2">I Want To Learn</span>
              {learningSkills.length === 0 ? (
                <span className="text-2xs text-slate-500">No learning skills added.</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {learningSkills.map((s, i) => (
                    <span key={i} className="rounded-full bg-indigo-950/45 border border-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('profile', user.id)}
              className="w-full text-center py-2 border border-dashed border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition"
              id="dash-modify-skills-btn"
            >
              Modify Skills
            </button>
          </div>

          {/* Outgoing requests status */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md">
            <h2 className="font-sans text-xs font-bold text-slate-100 uppercase tracking-wider mb-3">Outgoing Requests ({outgoingRequests.length})</h2>
            {outgoingRequests.length === 0 ? (
              <p className="text-2xs text-slate-500 py-4 text-center">No pending outgoing requests.</p>
            ) : (
              <div className="space-y-3">
                {outgoingRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between text-2xs p-2 rounded-lg bg-slate-950 border border-slate-850">
                    <div className="min-w-0 flex-1">
                      <span className="block font-bold text-slate-200 truncate">To {req.receiverName}</span>
                      <span className="text-[10px] text-slate-400 truncate">For {req.skill}</span>
                    </div>
                    <span className="rounded-full bg-amber-950/45 border border-amber-500/10 text-amber-400 text-[9px] font-semibold px-2 py-0.5">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
