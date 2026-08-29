/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Star, MapPin, Linkedin, Github, Globe, Award, Calendar, 
  MessageSquare, Edit, Save, Plus, X, ShieldAlert, CheckCircle 
} from 'lucide-react';
import { Profile, UserSkill, Review } from '../types';

interface ProfileViewProps {
  currentUserId: string;
  targetUserId: string;
  onNavigate: (view: string, id?: string) => void;
  onSendRequest: (reqData: {
    receiverId: string;
    skill: string;
    topic: string;
    preferredDate: string;
    preferredTime: string;
    description: string;
  }) => Promise<void>;
}

export default function ProfileView({
  currentUserId,
  targetUserId,
  onNavigate,
  onSendRequest
}: ProfileViewProps) {
  const isOwnProfile = currentUserId === targetUserId;

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile form state (if isOwnProfile)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');
  
  const [editCanTeach, setEditCanTeach] = useState<string[]>([]);
  const [teachInput, setTeachInput] = useState('');
  const [editWantsLearn, setEditWantsLearn] = useState<string[]>([]);
  const [learnInput, setLearnInput] = useState('');

  // Send Request Modal state (if viewing another profile)
  const [isRequesting, setIsRequesting] = useState(false);
  const [reqSkill, setReqSkill] = useState('');
  const [reqTopic, setReqTopic] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [reqTime, setReqTime] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  
  // Feedback states
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfileDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUserData(data);
        
        // Populate edit state
        if (data.profile) {
          setEditName(data.profile.name || '');
          setEditBio(data.profile.bio || '');
          setEditExperience(data.profile.experience || '');
          setEditLocation(data.profile.location || '');
          setEditLinkedin(data.profile.linkedin || '');
          setEditGithub(data.profile.github || '');
          setEditPortfolio(data.profile.portfolio || '');
        }

        if (Array.isArray(data.skills)) {
          setEditCanTeach(data.skills.filter((s: any) => s.type === 'TEACH').map((s: any) => s.skillName));
          setEditWantsLearn(data.skills.filter((s: any) => s.type === 'LEARN').map((s: any) => s.skillName));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [targetUserId]);

  const handleSaveProfile = async () => {
    if (!editName) {
      setErrorMsg('Name is a required field');
      return;
    }
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}`
        },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          experience: editExperience,
          location: editLocation,
          linkedin: editLinkedin,
          github: editGithub,
          portfolio: editPortfolio,
          canTeach: editCanTeach,
          wantsToLearn: editWantsLearn
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh current view
      fetchProfileDetails();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSkill || !reqTopic || !reqDate || !reqTime) {
      setErrorMsg('Please enter all required request details');
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await onSendRequest({
        receiverId: targetUserId,
        skill: reqSkill,
        topic: reqTopic,
        preferredDate: reqDate,
        preferredTime: reqTime,
        description: reqDesc
      });

      setSuccessMsg('Request sent successfully! Once accepted, the session will schedule automatically.');
      setIsRequesting(false);
      
      // Clear request form
      setReqTopic('');
      setReqDate('');
      setReqTime('');
      setReqDesc('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send learning request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-455 border-t-transparent mx-auto" />
        <p className="text-xs text-slate-500 mt-2">Fetching community profile details...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="py-20 text-center text-slate-500 max-w-sm mx-auto space-y-3">
        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
        <p className="font-bold text-white">Profile Not Found</p>
        <p className="text-xs text-slate-400">The requested user account does not exist or has been deleted.</p>
        <button onClick={() => onNavigate('dashboard')} className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { profile, skills, reviews } = userData;
  const canTeachList = skills.filter((s: any) => s.type === 'TEACH').map((s: any) => s.skillName);
  const wantsLearnList = skills.filter((s: any) => s.type === 'LEARN').map((s: any) => s.skillName);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="profile-view-container">
      
      {/* Toast Feedback */}
      {successMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-950/45 border border-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-950/45 border border-red-500/10 p-4 text-xs font-semibold text-red-400 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column - Card Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md text-center space-y-4">
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-2xl bg-slate-950 ring-4 ring-indigo-950 shrink-0">
              <img 
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${targetUserId}`} 
                alt={profile?.name} 
                className="object-cover h-full w-full"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <h2 className="font-sans text-lg font-bold text-white">{profile?.name}</h2>
              <p className="text-xs text-slate-400 mt-1">{profile?.experience || 'SkillBridge Member'}</p>
              <span className="inline-flex items-center space-x-1 text-2xs text-slate-550 mt-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile?.location || 'Global'}</span>
              </span>
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              {profile?.linkedin && (
                <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-850 transition">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile?.github && (
                <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 bg-slate-955 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 transition">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile?.portfolio && (
                <a href={`https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 bg-slate-955 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-850 transition">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-850 py-2.5 text-xs font-semibold text-slate-100 hover:bg-indigo-600 border border-slate-700/50 transition"
                  id="profile-toggle-edit-btn"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (canTeachList.length > 0) {
                        setReqSkill(canTeachList[0]);
                      }
                      setIsRequesting(true);
                    }}
                    className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-950/40"
                    id="profile-send-request-btn"
                  >
                    Send Swap Request
                  </button>
                  <button
                    onClick={() => onNavigate('chat', targetUserId)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition flex items-center justify-center space-x-1.5"
                    id="profile-chat-btn"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Core Stats Overview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-4">
            <h3 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">Metrics Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-850">
                <span className="block text-xl font-bold text-slate-100">{profile?.sessionsConducted}</span>
                <span className="text-[10px] text-slate-500">Conducted</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-850">
                <span className="block text-xl font-bold text-slate-100">{profile?.sessionsAttended}</span>
                <span className="text-[10px] text-slate-500">Attended</span>
              </div>
              <div className="rounded-xl bg-slate-955 p-3 border border-slate-850">
                <span className="block text-xl font-bold text-slate-100">{profile?.studentsHelped}</span>
                <span className="text-[10px] text-slate-500">Helpers</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-850">
                <span className="block text-xl font-bold text-slate-100 flex items-center justify-center space-x-1">
                  <span>{profile?.averageRating || 5.0}</span>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </span>
                <span className="text-[10px] text-slate-500">Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns - Edit Profile OR Detailed Bio + Skills + Reviews */}
        <div className="lg:col-span-2 space-y-6">
          
          {isEditing ? (
            /* EDIT FORM VIEW */
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md space-y-6" id="profile-edit-panel">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <h3 className="font-sans text-base font-bold text-white">Modify Professional Profile</h3>
                <span className="text-xs text-slate-500">Fill in accurate details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:border-indigo-500"
                    id="edit-profile-name"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:border-indigo-500 placeholder-slate-650"
                    id="edit-profile-location"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience / Role Statement</label>
                  <input
                    type="text"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    placeholder="e.g. Senior Java Dev at TechCorp (5 years)"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:border-indigo-500 placeholder-slate-650"
                    id="edit-profile-experience"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">Professional Bio</label>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 focus:border-indigo-500 placeholder-slate-650"
                    placeholder="Write a few paragraphs about what technologies you are comfortable teaching and why..."
                    id="edit-profile-bio"
                  />
                </div>

                {/* Social links */}
                <div>
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">LinkedIn Username</label>
                  <input
                    type="text"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-955 px-3 py-2.5 text-sm text-slate-100 focus:border-indigo-500 placeholder-slate-650"
                    id="edit-profile-linkedin"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">GitHub Username</label>
                  <input
                    type="text"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="github.com/username"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:border-indigo-500 placeholder-slate-650"
                    id="edit-profile-github"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">Portfolio / Website Link</label>
                  <input
                    type="text"
                    value={editPortfolio}
                    onChange={(e) => setEditPortfolio(e.target.value)}
                    placeholder="e.g. myname.dev"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:border-indigo-500 placeholder-slate-650"
                    id="edit-profile-portfolio"
                  />
                </div>
              </div>

              {/* Edit Skills list */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <h4 className="font-sans text-xs font-bold text-white">Manage Skills Profiles</h4>
                
                {/* TEACH */}
                <div className="space-y-2">
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider">Skills I Can Teach</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={teachInput}
                      onChange={(e) => setTeachInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = teachInput.trim();
                          if (val && !editCanTeach.includes(val)) {
                            setEditCanTeach([...editCanTeach, val]);
                            setTeachInput('');
                          }
                        }
                      }}
                      placeholder="Type a skill and press Enter"
                      className="block flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 placeholder-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = teachInput.trim();
                        if (val && !editCanTeach.includes(val)) {
                          setEditCanTeach([...editCanTeach, val]);
                          setTeachInput('');
                        }
                      }}
                      className="rounded-xl bg-slate-855 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-indigo-600 border border-slate-700/50 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editCanTeach.map((sc, idx) => (
                      <span key={idx} className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-950/45 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/10">
                        <span>{sc}</span>
                        <X className="w-3 h-3 cursor-pointer text-emerald-500" onClick={() => setEditCanTeach(editCanTeach.filter((_, i) => i !== idx))} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* LEARN */}
                <div className="space-y-2">
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider">Skills I Want To Learn</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={learnInput}
                      onChange={(e) => setLearnInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = learnInput.trim();
                          if (val && !editWantsLearn.includes(val)) {
                            setEditWantsLearn([...editWantsLearn, val]);
                            setLearnInput('');
                          }
                        }
                      }}
                      placeholder="Type a skill and press Enter"
                      className="block flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 placeholder-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = learnInput.trim();
                        if (val && !editWantsLearn.includes(val)) {
                          setEditWantsLearn([...editWantsLearn, val]);
                          setLearnInput('');
                        }
                      }}
                      className="rounded-xl bg-slate-855 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-indigo-600 border border-slate-700/50 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editWantsLearn.map((sc, idx) => (
                      <span key={idx} className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-950/45 px-2.5 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/10">
                        <span>{sc}</span>
                        <X className="w-3 h-3 cursor-pointer text-indigo-500" onClick={() => setEditWantsLearn(editWantsLearn.filter((_, i) => i !== idx))} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SAVE & CANCEL CTAs */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-450 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-950/40 hover:bg-indigo-500"
                  id="profile-save-btn"
                >
                  <Save className="w-4 h-4" />
                  <span>{actionLoading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* NORMAL PROFILE VIEW */
            <div className="space-y-6">
              
              {/* Detailed bio */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md space-y-4">
                <h3 className="font-sans text-base font-bold text-white">Professional Summary</h3>
                <p className="font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {profile?.bio || 'This community member has not added a detailed bio. Get in touch to swap skills!'}
                </p>
              </div>

              {/* Skills Lists */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Can Teach */}
                <div className="space-y-3">
                  <h4 className="font-sans text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-1.5 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Skills I Can Teach</span>
                  </h4>
                  {canTeachList.length === 0 ? (
                    <p className="text-2xs text-slate-500">None declared yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {canTeachList.map((sc: string, idx: number) => (
                        <span key={idx} className="rounded-lg bg-emerald-950/45 border border-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                          {sc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Wants Learn */}
                <div className="space-y-3">
                  <h4 className="font-sans text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-1.5 text-indigo-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Skills I Want To Learn</span>
                  </h4>
                  {wantsLearnList.length === 0 ? (
                    <p className="text-2xs text-slate-500">None declared yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {wantsLearnList.map((sc: string, idx: number) => (
                        <span key={idx} className="rounded-lg bg-indigo-950/45 border border-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400">
                          {sc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Peer Reviews list */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md space-y-4">
                <h3 className="font-sans text-base font-bold text-white">Peer Reviews ({reviews?.length || 0})</h3>
                {reviews?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No reviews submitted for this member yet.</p>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {reviews.map((rev: Review) => (
                      <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-950 shrink-0">
                              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${rev.reviewerId}`} alt={rev.reviewerName} className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-200 leading-none">{rev.reviewerName}</span>
                              <span className="text-[9px] font-semibold text-indigo-400">Reviewed for: {rev.skill}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-0.5 text-xs font-bold text-amber-550">
                            <span>{rev.rating}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>
                        </div>

                        <p className="text-xs font-sans text-slate-350 leading-normal pl-10">
                          "{rev.reviewText}"
                        </p>
                        <span className="block text-[9px] font-mono text-slate-500 text-right">
                          {new Date(rev.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* REQUEST SWAP MODAL */}
      {isRequesting && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-800 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="font-sans text-base font-bold text-white">Send Mentoring Swap Request</h3>
                <p className="text-[10px] text-slate-400">To {profile?.name}</p>
              </div>
              <button onClick={() => setIsRequesting(false)} className="rounded-lg p-1 text-slate-450 hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4" id="request-swap-form">
              {/* Choose Skill */}
              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Skill you want to learn
                </label>
                <select
                  value={reqSkill}
                  onChange={(e) => setReqSkill(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  id="request-skill-select"
                >
                  {canTeachList.map((sk: string, i: number) => (
                    <option key={i} value={sk} className="bg-slate-900">{sk}</option>
                  ))}
                  {canTeachList.length === 0 && <option value="" className="bg-slate-900">No skills declared</option>}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Topic of Mentoring
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Setting up Context API or Spring Boot MVC setup"
                  value={reqTopic}
                  onChange={(e) => setReqTopic(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-105 outline-none focus:border-indigo-500 placeholder-slate-600"
                  id="request-topic-input"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={reqDate}
                    onChange={(e) => setReqDate(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-955 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
                    id="request-date-input"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    required
                    value={reqTime}
                    onChange={(e) => setReqTime(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-955 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
                    id="request-time-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Message / Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Introduce yourself, describe what project or concept you need help with, and what you can offer back in swap!"
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 outline-none focus:border-indigo-500 placeholder-slate-600"
                  id="request-desc-textarea"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRequesting(false)}
                  className="rounded-xl border border-slate-850 bg-slate-955 px-4 py-2 text-xs font-semibold text-slate-450 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-950/40 hover:bg-indigo-500"
                  id="request-submit-btn"
                >
                  {actionLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
