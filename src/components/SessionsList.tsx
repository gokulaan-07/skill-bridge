/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckSquare, Star, ExternalLink, RefreshCw, BookOpen, Clock, AlertCircle, ShieldAlert, HeartHandshake, Smile, X 
} from 'lucide-react';
import { Session, User } from '../types';

interface SessionsListProps {
  currentUser: User;
  onNavigate: (view: string, id?: string) => void;
}

export default function SessionsList({ currentUser, onNavigate }: SessionsListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [activeSessionForReview, setActiveSessionForReview] = useState<Session | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  
  // Feedback states
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSessions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCompleteSession = async (sessId: string) => {
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/sessions/${sessId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to complete session');

      setSuccessMsg('Session marked as COMPLETED. Your profile metrics are updated! Please leave a review for your peer.');
      fetchSessions();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionForReview) return;
    if (!reviewText.trim()) {
      setErrorMsg('Please write a feedback review message');
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/sessions/${activeSessionForReview.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}`
        },
        body: JSON.stringify({
          rating,
          reviewText: reviewText.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit review');

      setSuccessMsg('Feedback submitted! Peer profile ratings updated.');
      setActiveSessionForReview(null);
      setReviewText('');
      setRating(5);
      fetchSessions();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-550">Loading your swapping session agendas...</p>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED');
  const pastSessions = sessions.filter(s => s.status === 'COMPLETED' || s.status === 'CANCELLED');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="sessions-view-container">
      
      {/* Page header */}
      <div>
        <h1 className="font-sans text-2xl font-bold text-white tracking-tight">Your Swapping Calendar</h1>
        <p className="text-xs text-slate-400 mt-1">Participate, complete, and review your live peer mentoring swapping sessions</p>
      </div>

      {/* Toast Feedback */}
      {successMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-950/45 border border-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 animate-in fade-in">
          <Smile className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-950/45 border border-red-500/10 p-4 text-xs font-semibold text-red-450 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid splits scheduled and past */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Scheduled Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md">
            <h2 className="font-sans text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Upcoming Sessions ({upcomingSessions.length})</span>
            </h2>

            {upcomingSessions.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                <p>No upcoming live sessions scheduled.</p>
                <p className="text-[10px] text-slate-650">Head over to <b>Find Swaps</b> to send requests to other members!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map(sess => {
                  const isMentor = sess.mentorId === currentUser.id;
                  const partnerName = isMentor ? sess.learnerName : sess.mentorName;
                  const roleLabel = isMentor ? 'Teaching' : 'Learning';

                  return (
                    <div key={sess.id} className="rounded-xl border border-slate-800 p-4 hover:border-slate-700 hover:bg-slate-800/30 transition space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            isMentor 
                              ? 'bg-emerald-950/45 border border-emerald-500/10 text-emerald-400' 
                              : 'bg-indigo-950/45 border border-indigo-500/10 text-indigo-400'
                          }`}>
                            {roleLabel}: {sess.skill}
                          </span>
                          <h3 className="font-sans text-sm font-bold text-slate-100 mt-2">{sess.topic}</h3>
                          <p className="text-2xs text-slate-400 mt-0.5">Swap Partner: {partnerName}</p>
                        </div>

                        <div className="font-mono text-xs text-slate-400 sm:text-right bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-850 shrink-0">
                          <span className="block font-bold text-slate-200">{sess.date}</span>
                          <span className="text-[10px] text-slate-500">{sess.time}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row pt-3 border-t border-slate-800 items-center justify-between gap-3">
                        <span className="text-2xs font-mono text-indigo-400 flex items-center space-x-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <a href={sess.googleMeetLink} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px] sm:max-w-xs">
                            {sess.googleMeetLink}
                          </a>
                        </span>

                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleCompleteSession(sess.id)}
                            disabled={actionLoading}
                            className="flex-1 sm:flex-none text-center rounded-lg bg-slate-850 border border-slate-700/50 px-3.5 py-2 text-2xs font-bold text-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-550 transition"
                            id={`complete-session-${sess.id}`}
                          >
                            Complete Session
                          </button>
                          <a
                            href={sess.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none text-center rounded-lg bg-indigo-600 px-3.5 py-2 text-2xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-950/40"
                          >
                            Join Meet
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Past and completed reviews */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md">
            <h2 className="font-sans text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Past & Completed ({pastSessions.length})</span>
            </h2>

            {pastSessions.length === 0 ? (
              <p className="text-2xs text-slate-500 py-6 text-center">No past swapping sessions completed yet.</p>
            ) : (
              <div className="space-y-3">
                {pastSessions.map(sess => {
                  const isMentor = sess.mentorId === currentUser.id;
                  const partnerName = isMentor ? sess.learnerName : sess.mentorName;
                  const wasReviewed = isMentor ? sess.reviewedByMentor : sess.reviewedByLearner;

                  return (
                    <div key={sess.id} className="text-2xs p-3.5 rounded-xl border border-slate-850 bg-slate-950/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 truncate">{sess.skill}</span>
                        <span className="font-mono text-[9px] text-slate-500">{sess.date}</span>
                      </div>
                      <p className="text-slate-450 line-clamp-1">{sess.topic}</p>
                      
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500">With {partnerName}</span>
                        
                        {sess.status === 'COMPLETED' ? (
                          wasReviewed ? (
                            <span className="text-[9px] text-emerald-450 font-bold flex items-center space-x-1">
                              <span>★ Reviewed</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setActiveSessionForReview(sess)}
                              className="rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-500/10 px-2 py-1 text-[9px] font-bold hover:bg-indigo-900/45 transition"
                            >
                              Leave Feedback
                            </button>
                          )
                        ) : (
                          <span className="text-[9px] text-red-405 font-bold">Cancelled</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FEEDBACK & RATING MODAL */}
      {activeSessionForReview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-800 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="font-sans text-sm font-bold text-white">Write Peer Feedback</h3>
                <p className="text-[10px] text-slate-400">How was your session swap with {activeSessionForReview.mentorId === currentUser.id ? activeSessionForReview.learnerName : activeSessionForReview.mentorName}?</p>
              </div>
              <button onClick={() => setActiveSessionForReview(null)} className="rounded-lg p-1 text-slate-450 hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4" id="leave-feedback-form">
              {/* Rating selection stars */}
              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Session Star Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(starNum => (
                    <button
                      key={starNum}
                      type="button"
                      onClick={() => setRating(starNum)}
                      className="transition active:scale-95 animate-in"
                    >
                      <Star className={`w-8 h-8 ${
                        starNum <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-800'
                      }`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-400 ml-2">{rating} out of 5</span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Write Feedback Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain what you swapped, how they helped, and praise their mentoring qualities!"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 outline-none focus:border-indigo-500 placeholder-slate-600"
                  id="review-text-textarea"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveSessionForReview(null)}
                  className="rounded-xl border border-slate-850 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-450 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-950/40 hover:bg-indigo-500"
                  id="review-submit-btn"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
