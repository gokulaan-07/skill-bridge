/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Star, MapPin, Award, BookOpen, RefreshCw, Filter, ShieldAlert 
} from 'lucide-react';

interface SearchUsersProps {
  currentUserId: string;
  onNavigate: (view: string, targetUserId?: string) => void;
}

export default function SearchUsers({ currentUserId, onNavigate }: SearchUsersProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search parameters
  const [query, setQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [allSkills, setAllSkills] = useState<string[]>([]);
  
  // Quick filters
  const [teachFilter, setTeachFilter] = useState(true); // default look for mentors who can teach

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `/api/users?query=${encodeURIComponent(query)}`;
      if (selectedSkill) {
        url += `&skill=${encodeURIComponent(selectedSkill)}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to search users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillsList = async () => {
    try {
      const response = await fetch('/api/skills');
      const data = await response.json();
      if (response.ok) {
        setAllSkills(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSkillsList();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [query, selectedSkill, teachFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6" id="search-container">
      
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-white">Find Swapping Partners</h1>
          <p className="text-xs text-slate-400 mt-1">Discover mentors, connect with skilled people, and grow together</p>
        </div>

        {/* Dynamic Preset Category Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTeachFilter(true)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              teachFilter 
                ? 'bg-slate-850 text-indigo-400 border border-slate-700/50 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Looking for Teachers
          </button>
          <button
            onClick={() => setTeachFilter(false)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              !teachFilter 
                ? 'bg-slate-850 text-indigo-400 border border-slate-700/50 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Looking for Learners
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Text query Search */}
        <div className="relative md:col-span-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Search by name, location, experience, or bio details..."
            id="search-query-input"
          />
        </div>

        {/* Skill Category Dropdown */}
        <div className="relative">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="block w-full rounded-xl border border-slate-800 py-3 px-3 text-sm text-slate-200 outline-none bg-slate-900 focus:border-indigo-500"
            id="search-skill-dropdown"
          >
            <option value="" className="bg-slate-900">Filter by Skill (All)</option>
            {allSkills.map((sk, index) => (
              <option key={index} value={sk} className="bg-slate-900">{sk}</option>
            ))}
          </select>
        </div>
      </div>

      {/* User cards catalog */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Scanning the SkillBridge community database...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center space-y-2 rounded-2xl bg-slate-900 border border-slate-800 p-8">
          <ShieldAlert className="w-10 h-10 text-slate-550 mx-auto" />
          <p className="text-sm font-bold text-slate-100">No swapping partners found</p>
          <p className="text-xs text-slate-400">Try loosening your search terms or choosing a different skill filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" id="search-results-grid">
          {users.map(u => {
            const teaches = u.skills.filter((s: any) => s.type === 'TEACH').map((s: any) => s.skillName);
            const learns = u.skills.filter((s: any) => s.type === 'LEARN').map((s: any) => s.skillName);

            return (
              <div 
                key={u.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:shadow-2xl hover:border-slate-700 hover:bg-slate-900 transition"
              >
                {/* Profile Header */}
                <div className="flex items-start space-x-3 pb-3 border-b border-slate-800/80">
                  <div className="h-11 w-11 overflow-hidden rounded-xl bg-slate-955 ring-2 ring-indigo-950 shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id}`} 
                      alt={u.profile?.name} 
                      className="object-cover h-full w-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans text-xs font-bold text-slate-100 truncate">{u.profile?.name}</h3>
                    <p className="text-[10px] text-slate-450 truncate mt-0.5">{u.profile?.experience || 'New Member'}</p>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="truncate">{u.profile?.location || 'Global'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-0.5 rounded-lg bg-amber-950/45 border border-amber-500/10 px-1.5 py-0.5 text-xs font-bold text-amber-450">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <span>{u.profile?.averageRating || 5.0}</span>
                  </div>
                </div>

                {/* Profile Bio */}
                <p className="py-3 font-sans text-[11px] text-slate-300 line-clamp-3 leading-relaxed flex-1">
                  {u.profile?.bio || 'This user is ready to learn and teach. Connect to explore a reciprocating skill swap!'}
                </p>

                {/* Skills Section */}
                <div className="space-y-3 pb-4">
                  {/* TEACH */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-bold text-emerald-450 uppercase tracking-wider">Can Teach:</span>
                    <div className="flex flex-wrap gap-1">
                      {teaches.length === 0 ? (
                        <span className="text-2xs text-slate-500">-</span>
                      ) : (
                        teaches.map((t: string, i: number) => (
                          <span key={i} className="rounded-md bg-emerald-950/45 border border-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-450">
                            {t}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* LEARN */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-bold text-indigo-450 uppercase tracking-wider">Wants To Learn:</span>
                    <div className="flex flex-wrap gap-1">
                      {learns.length === 0 ? (
                        <span className="text-2xs text-slate-500">-</span>
                      ) : (
                        learns.map((l: string, i: number) => (
                          <span key={i} className="rounded-md bg-indigo-950/45 border border-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-450">
                            {l}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* View Profile CTA */}
                <button
                  onClick={() => onNavigate('profile', u.id)}
                  className="w-full text-center py-2.5 rounded-xl bg-slate-850 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700/50 hover:bg-indigo-650 transition"
                  id={`connect-user-${u.id}`}
                >
                  View Profile & Swap
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
