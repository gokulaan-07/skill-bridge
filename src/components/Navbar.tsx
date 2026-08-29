/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Bell, MessageSquare, LogOut, Search, User, Calendar, ShieldCheck, CheckCircle 
} from 'lucide-react';
import { User as UserType, Notification } from '../types';

interface NavbarProps {
  user: UserType | null;
  currentView: string;
  onNavigate: (view: string, targetUserId?: string) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
}

export default function Navbar({
  user,
  currentView,
  onNavigate,
  onLogout,
  notifications,
  onMarkNotificationRead
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'REQUEST': return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'ACCEPT': return <CheckCircle className="w-4 h-4 text-sky-500" />;
      case 'SESSION': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'MESSAGE': return <MessageSquare className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')} 
          className="flex cursor-pointer items-center space-x-2.5 transition active:scale-95"
          id="nav-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-950/50">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-sans text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              SkillBridge
            </span>
            <span className="hidden sm:block text-[10px] font-mono tracking-wider text-slate-500 uppercase -mt-1">
              Learn • Teach • Grow
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        {user ? (
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onNavigate('search')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                currentView === 'search' 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
              id="nav-search-btn"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Find Swaps</span>
            </button>

            <button
              onClick={() => onNavigate('sessions')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                currentView === 'sessions' 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
              id="nav-sessions-btn"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">Sessions</span>
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                currentView === 'chat' 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
              id="nav-chat-btn"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Messages</span>
            </button>

            {user.role === 'ADMIN' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  currentView === 'admin' 
                    ? 'bg-red-600/20 text-red-400 border border-red-500/20' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                }`}
                id="nav-admin-btn"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* Notification Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-slate-100 ${
                  showNotifications ? 'bg-slate-800' : ''
                }`}
                id="nav-notifications-toggle"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                  </span>
                )}
              </button>

              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-xl ring-1 ring-black/20 transition z-50"
                  id="notifications-dropdown"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 font-sans text-xs font-semibold text-slate-400">
                    <span>Notifications ({unreadCount} new)</span>
                    {unreadCount > 0 && <span className="text-[10px] text-indigo-400">Click to clear</span>}
                  </div>
                  <div className="max-h-64 overflow-y-auto pt-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center font-sans text-xs text-slate-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onMarkNotificationRead(notif.id);
                            if (notif.type === 'REQUEST') onNavigate('dashboard');
                            if (notif.type === 'SESSION' || notif.type === 'REVIEW') onNavigate('sessions');
                            if (notif.type === 'MESSAGE') onNavigate('chat');
                            setShowNotifications(false);
                          }}
                          className={`flex items-start space-x-2.5 cursor-pointer rounded-lg p-2.5 text-left transition hover:bg-slate-800/60 ${
                            !notif.read ? 'bg-indigo-950/40' : ''
                          }`}
                        >
                          <div className="mt-0.5 rounded-md bg-slate-800 p-1">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-xs text-slate-200 leading-normal">
                              {notif.content}
                            </p>
                            <span className="font-mono text-[9px] text-slate-500">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Quick Nav */}
            <button
              onClick={() => onNavigate('profile', user.id)}
              className={`flex items-center space-x-1.5 rounded-lg px-2 py-1 transition ${
                currentView === 'profile' ? 'bg-slate-800' : 'hover:bg-slate-800'
              }`}
              id="nav-profile-btn"
            >
              <div className="h-8 w-8 overflow-hidden rounded-lg bg-indigo-950 ring-2 ring-indigo-950">
                <img
                  src={user.role === 'ADMIN' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.email}`}
                  alt="My avatar"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-slate-300">Me</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
              title="Logout"
              id="nav-logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </nav>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('login')}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-950/50 transition"
              id="nav-signin-btn"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-950/20 hover:bg-indigo-500 transition"
              id="nav-signup-btn"
            >
              Join SkillBridge
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
