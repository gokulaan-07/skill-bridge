/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.js';
import LandingPage from './components/LandingPage.js';
import AuthPage from './components/AuthPage.js';
import Dashboard from './components/Dashboard.js';
import SearchUsers from './components/SearchUsers.js';
import ProfileView from './components/ProfileView.js';
import ChatInbox from './components/ChatInbox.js';
import SessionsList from './components/SessionsList.js';
import AdminPanel from './components/AdminPanel.js';

import { User, Profile, LearningRequest, Session, Notification } from './types.js';

export default function App() {
  // Navigation Routing State
  const [currentView, setCurrentView] = useState<string>('landing');
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Operational Lists
  const [requests, setRequests] = useState<LearningRequest[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const checkAuth = async () => {
    const token = localStorage.getItem('skillbridge_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setProfile(data.profile);
        setSkills(data.skills);
        setCurrentView('dashboard');
        
        // Fetch remaining workspace lists
        await syncUserData(token);
      } else {
        // Bad token
        localStorage.removeItem('skillbridge_token');
      }
    } catch (err) {
      console.error('Auth verification error', err);
    } finally {
      setLoading(false);
    }
  };

  const syncUserData = async (token: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [reqRes, sessRes, notifRes] = await Promise.all([
        fetch('/api/requests', { headers }),
        fetch('/api/sessions', { headers }),
        fetch('/api/notifications', { headers })
      ]);

      if (reqRes.ok) setRequests(await reqRes.json());
      if (sessRes.ok) setSessions(await sessRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (err) {
      console.error('Failed to sync workspace lists', err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Poll notifications and list updates every 5 seconds when authenticated
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const token = localStorage.getItem('skillbridge_token');
      if (token) {
        syncUserData(token);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleAuthSuccess = (token: string, newUser: User, newProfile: Profile, newSkills: any[]) => {
    localStorage.setItem('skillbridge_token', token);
    setUser(newUser);
    setProfile(newProfile);
    setSkills(newSkills);
    setCurrentView('dashboard');
    syncUserData(token);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('skillbridge_token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('skillbridge_token');
    setUser(null);
    setProfile(null);
    setSkills([]);
    setRequests([]);
    setSessions([]);
    setNotifications([]);
    setCurrentView('landing');
  };

  const handleNavigate = (view: string, id?: string) => {
    setTargetUserId(id || null);
    setCurrentView(view);
    // Smooth scroll to top on nav changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRespondToRequest = async (reqId: string, action: 'ACCEPT' | 'REJECT' | 'CANCEL') => {
    try {
      const token = localStorage.getItem('skillbridge_token');
      const response = await fetch(`/api/requests/${reqId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        // Force refresh user data state
        syncUserData(token!);
        // Refresh local profile as metrics might have updated due to completing/accepting
        fetch(`/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => {
            if (data.profile) setProfile(data.profile);
          });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRequest = async (reqData: any) => {
    const token = localStorage.getItem('skillbridge_token');
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reqData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request submission failed.');
    }

    syncUserData(token!);
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const token = localStorage.getItem('skillbridge_token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Toggle locally to save an extra fetch
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 font-sans">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto" />
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">SkillBridge</h1>
            <p className="text-[10px] text-slate-500">Securing environment connection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Global Navigation header */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      {/* Primary routing layout */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {(currentView === 'login' || currentView === 'register') && (
          <AuthPage
            initialMode={currentView}
            onAuthSuccess={handleAuthSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'dashboard' && user && profile && (
          <Dashboard
            user={user}
            profile={profile}
            skills={skills}
            requests={requests}
            sessions={sessions}
            notifications={notifications}
            onNavigate={handleNavigate}
            onRespondToRequest={handleRespondToRequest}
          />
        )}

        {currentView === 'search' && user && (
          <SearchUsers
            currentUserId={user.id}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'profile' && user && (
          <ProfileView
            currentUserId={user.id}
            targetUserId={targetUserId || user.id}
            onNavigate={handleNavigate}
            onSendRequest={handleSendRequest}
          />
        )}

        {currentView === 'chat' && user && (
          <ChatInbox
            currentUser={user}
            activeChatPartnerId={targetUserId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'sessions' && user && (
          <SessionsList
            currentUser={user}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'admin' && user?.role === 'ADMIN' && (
          <AdminPanel />
        )}
      </main>

    </div>
  );
}
