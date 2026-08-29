/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, BarChart3, MessageCircle, Calendar, Trash2, ShieldAlert, RefreshCw, Smile, Star 
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'sessions' | 'feedback'>('analytics');
  
  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Lists State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  
  // General feedback
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}` }
      });
      const data = await response.json();
      if (response.ok) setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}` }
      });
      const data = await response.json();
      if (response.ok) setUsersList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}` }
      });
      const data = await response.json();
      if (response.ok) setSessionsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/admin/feedback', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}` }
      });
      const data = await response.json();
      if (response.ok) setFeedbackList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAnalytics(),
      fetchUsers(),
      fetchSessions(),
      fetchFeedback()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const handleDeleteUser = async (targetId: string) => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to permanently delete this user profile? All of their skill pairings, scheduled sessions, messages, and feedback records will be completely erased from the platform database.')) {
      return;
    }

    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/admin/users/${targetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete user');

      setSuccessMsg('Fake account deleted and database relations cleaned up!');
      loadAdminData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 text-red-450 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading Administrative Oversight Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6" id="admin-panel-container">
      
      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-tr from-red-950 via-slate-950 to-slate-950 border border-red-900/30 p-6 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-red-500/10 p-2.5 border border-red-500/20">
            <ShieldCheck className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-extrabold tracking-tight">Oversight Admin Dashboard</h1>
            <p className="text-[11px] text-red-300">Moderate accounts, view analytical charts, audit reviews, and remove fake records</p>
          </div>
        </div>
        <button onClick={loadAdminData} className="rounded-lg bg-slate-900/80 border border-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/45 transition">
          Sync Database
        </button>
      </div>

      {/* Toast Feedbacks */}
      {successMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-950/45 border border-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 animate-in fade-in">
          <Smile className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-950/45 border border-red-500/10 p-4 text-xs font-semibold text-red-400 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 pb-px space-x-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-1.5 rounded-t-xl px-4 py-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'analytics' 
              ? 'border-red-500 text-red-400 bg-red-950/30' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-1.5 rounded-t-xl px-4 py-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'users' 
              ? 'border-red-500 text-red-400 bg-red-950/30' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Moderate Accounts ({usersList.filter(u => u.role !== 'ADMIN').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center space-x-1.5 rounded-t-xl px-4 py-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'sessions' 
              ? 'border-red-500 text-red-400 bg-red-950/30' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Audit Sessions ({sessionsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center space-x-1.5 rounded-t-xl px-4 py-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'feedback' 
              ? 'border-red-500 text-red-400 bg-red-950/30' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Audit Reviews ({feedbackList.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md min-h-[350px]">
        
        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6" id="admin-tab-analytics">
            <h3 className="font-sans text-sm font-bold text-white border-b border-slate-800 pb-2">Global Platform Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-850 text-center">
                <span className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">Total Active Users</span>
                <span className="mt-1 block text-3xl font-extrabold text-white">{analytics.totalUsers}</span>
              </div>
              <div className="rounded-xl bg-slate-955 p-4 border border-slate-850 text-center">
                <span className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">Sessions Scheduled</span>
                <span className="mt-1 block text-3xl font-extrabold text-white">{analytics.totalSessions}</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-850 text-center">
                <span className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">Sessions Active</span>
                <span className="mt-1 block text-3xl font-extrabold text-indigo-400">{analytics.activeSessions}</span>
              </div>
              <div className="rounded-xl bg-slate-955 p-4 border border-slate-850 text-center">
                <span className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">Sessions Completed</span>
                <span className="mt-1 block text-3xl font-extrabold text-emerald-400">{analytics.completedSessions}</span>
              </div>
            </div>

            {/* Popular Skills list */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 space-y-4 max-w-xl">
              <div>
                <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider">Most Shared Peer Skills (Teaching)</h4>
                <p className="text-[10px] text-slate-450 mt-0.5">Top skills our community offers to swap</p>
              </div>
              <div className="space-y-2">
                {analytics.popularSkills.map((sk: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-2xs font-bold">
                      <span className="text-slate-250">{sk.name}</span>
                      <span className="text-slate-500">{sk.count} mentors</span>
                    </div>
                    {/* Visual bar chart */}
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-indigo-650 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (sk.count / analytics.totalUsers) * 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
                {analytics.popularSkills.length === 0 && (
                  <p className="text-2xs text-slate-500">Add skill listings to populate analytics.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MODERATE USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4" id="admin-tab-users">
            <h3 className="font-sans text-sm font-bold text-white border-b border-slate-800 pb-2">Active Member Accounts ({usersList.length})</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pt-1">User Detail</th>
                    <th className="pb-3 pt-1">Location</th>
                    <th className="pb-3 pt-1">Teaches / Learns</th>
                    <th className="pb-3 pt-1 text-center">Swaps (C / A)</th>
                    <th className="pb-3 pt-1 text-center">Rating</th>
                    <th className="pb-3 pt-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {usersList.map(u => {
                    const teaches = u.skills.filter((s: any) => s.type === 'TEACH').map((s: any) => s.skillName);
                    const learns = u.skills.filter((s: any) => s.type === 'LEARN').map((s: any) => s.skillName);
                    const isAdmin = u.role === 'ADMIN';

                    return (
                      <tr key={u.id} className="hover:bg-slate-950/40">
                        <td className="py-3.5 pr-3 flex items-center space-x-3">
                          <div className="h-9 w-9 overflow-hidden rounded-lg bg-slate-950 ring-2 ring-slate-800 shrink-0">
                            <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id}`} alt="avatar" className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0">
                            <span className="block font-bold text-slate-200">{u.profile?.name || 'Incomplete Account'}</span>
                            <span className="block text-[10px] text-slate-500 truncate">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-350">{u.profile?.location || 'Unknown'}</td>
                        <td className="py-3.5 pr-3 max-w-xs">
                          <div className="truncate">
                            <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wide">T:</span>{' '}
                            <span className="text-slate-350">{teaches.join(', ') || 'None'}</span>
                          </div>
                          <div className="truncate mt-0.5">
                            <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-wide">L:</span>{' '}
                            <span className="text-slate-350">{learns.join(', ') || 'None'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-center font-mono text-slate-300">
                          {u.profile?.sessionsConducted || 0} / {u.profile?.sessionsAttended || 0}
                        </td>
                        <td className="py-3.5 text-center font-bold text-slate-200">
                          {u.profile?.averageRating || 5.0} ★
                        </td>
                        <td className="py-3.5 text-right">
                          {isAdmin ? (
                            <span className="rounded bg-slate-950 text-slate-500 border border-slate-800 px-1.5 py-0.5 text-[9px] font-bold">SYSTEM</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="rounded bg-red-950/40 text-red-400 hover:bg-red-900/50 border border-red-500/10 p-1.5 transition"
                              title="Delete Account permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="space-y-4" id="admin-tab-sessions">
            <h3 className="font-sans text-sm font-bold text-white border-b border-slate-800 pb-2">Comprehensive Sessions Logs</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pt-1">Session Swaps</th>
                    <th className="pb-3 pt-1">Mentor</th>
                    <th className="pb-3 pt-1">Learner</th>
                    <th className="pb-3 pt-1">Scheduled Date</th>
                    <th className="pb-3 pt-1">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {sessionsList.map(sess => (
                    <tr key={sess.id} className="hover:bg-slate-950/40">
                      <td className="py-3.5 pr-2">
                        <span className="font-bold text-slate-200">{sess.skill}</span>
                        <p className="text-[10px] text-slate-500 truncate max-w-xs">{sess.topic}</p>
                      </td>
                      <td className="py-3.5 text-slate-300">{sess.mentorName}</td>
                      <td className="py-3.5 text-slate-300">{sess.learnerName}</td>
                      <td className="py-3.5 font-mono text-slate-400">{sess.date} ({sess.time})</td>
                      <td className="py-3.5">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          sess.status === 'COMPLETED' ? 'bg-emerald-950/45 border-emerald-500/10 text-emerald-400' :
                          sess.status === 'SCHEDULED' ? 'bg-indigo-950/45 border-indigo-500/10 text-indigo-400' : 'bg-red-950/45 border-red-500/10 text-red-400'
                        }`}>
                          {sess.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sessionsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">No swapping sessions recorded in database logs yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT FEEDBACKS */}
        {activeTab === 'feedback' && (
          <div className="space-y-4" id="admin-tab-feedback">
            <h3 className="font-sans text-sm font-bold text-white border-b border-slate-800 pb-2">Feedback & Review Comments</h3>
            
            <div className="space-y-4">
              {feedbackList.map(rev => (
                <div key={rev.id} className="rounded-xl border border-slate-850 bg-slate-950/30 p-4 space-y-3 hover:border-slate-800 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200">{rev.reviewerName}</span>
                      <span className="text-2xs text-slate-500">reviewed for skill "{rev.skill}"</span>
                    </div>
                    <div className="flex items-center space-x-0.5 text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-500/10 px-2 py-0.5 rounded-lg">
                      <span>{rev.rating}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic">
                    "{rev.reviewText}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Reviewee Account ID: {rev.revieweeId}</span>
                    <span>{new Date(rev.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {feedbackList.length === 0 && (
                <p className="text-xs text-slate-500 py-12 text-center">No reviews or ratings submitted by peers yet.</p>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
