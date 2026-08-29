/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ShieldAlert, RefreshCw, UserCheck } from 'lucide-react';
import { Message, User } from '../types';

interface ChatInboxProps {
  currentUser: User;
  activeChatPartnerId: string | null;
  onNavigate: (view: string, id?: string) => void;
}

export default function ChatInbox({
  currentUser,
  activeChatPartnerId,
  onNavigate
}: ChatInboxProps) {
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(activeChatPartnerId);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Fetch unique chat partners (channels)
  const fetchChannels = async () => {
    try {
      // Fetch all users on platform to see who we have conversations with or can swap with
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}`
        }
      });
      const allUsers = await response.json();
      if (response.ok) {
        // Simple heuristic: display all users who are not me as potential chat targets, 
        // with priority on those we have existing chats with
        setChannels(allUsers);
        
        // If there is an active target but it is not currently selected, set it
        if (activeChatPartnerId && !selectedPartnerId) {
          setSelectedPartnerId(activeChatPartnerId);
        } else if (!selectedPartnerId && allUsers.length > 0) {
          // Select first user as default
          setSelectedPartnerId(allUsers[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChannels(false);
    }
  };

  // Fetch messages with the selected partner
  const fetchMessages = async () => {
    if (!selectedPartnerId) return;
    try {
      const response = await fetch(`/api/chat/${selectedPartnerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch selected partner profile info
  const fetchPartnerProfile = async () => {
    if (!selectedPartnerId) return;
    try {
      const response = await fetch(`/api/users/${selectedPartnerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPartnerProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [activeChatPartnerId]);

  useEffect(() => {
    if (selectedPartnerId) {
      setLoadingMessages(true);
      fetchPartnerProfile();
      fetchMessages().then(() => setLoadingMessages(false));
    }
  }, [selectedPartnerId]);

  // Set up polling for new messages every 3 seconds
  useEffect(() => {
    if (!selectedPartnerId) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedPartnerId]);

  // Auto-scroll messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPartnerId) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('skillbridge_token')}`
        },
        body: JSON.stringify({
          receiverId: selectedPartnerId,
          content: textToSend
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, data]);
      }
    } catch (err) {
      console.error('Failed to send chat message', err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8" id="chat-container">
      <div className="h-[600px] rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        
        {/* Left pane: Active Channels/People */}
        <div className="border-r border-slate-800 flex flex-col h-full bg-slate-950/40">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Members Active</h2>
            <p className="text-[10px] text-slate-500">Connect to discuss reciprocal skill swappings</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingChannels ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin mx-auto mb-2" />
                <span>Finding members...</span>
              </div>
            ) : channels.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">No other members registered yet.</p>
            ) : (
              channels.map(chan => {
                const isSelected = chan.id === selectedPartnerId;
                const canTeach = chan.skills?.filter((s: any) => s.type === 'TEACH').map((s: any) => s.skillName) || [];

                return (
                  <div
                    key={chan.id}
                    onClick={() => setSelectedPartnerId(chan.id)}
                    className={`flex items-center space-x-3 rounded-xl p-3 cursor-pointer text-left transition ${
                      isSelected 
                        ? 'bg-slate-800 text-white shadow-md border border-slate-700/50' 
                        : 'hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="h-9 w-9 overflow-hidden rounded-lg bg-slate-950 ring-2 ring-slate-800 shrink-0">
                      <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${chan.id}`} alt={chan.profile?.name} className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={`block text-xs font-bold truncate ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>
                        {chan.profile?.name}
                      </span>
                      <span className={`block text-[9px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'} mt-0.5`}>
                        Teaches: {canTeach.slice(0, 2).join(', ') || 'General'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right pane: Chat details */}
        <div className="md:col-span-2 flex flex-col h-full bg-slate-900">
          {selectedPartnerId ? (
            <>
              {/* Partner info header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div 
                  onClick={() => onNavigate('profile', selectedPartnerId)}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <div className="h-9 w-9 overflow-hidden rounded-lg bg-slate-950">
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedPartnerId}`} alt="partner" className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="font-sans text-xs font-bold text-slate-100 group-hover:text-indigo-400 leading-none">
                      {partnerProfile?.name || 'Loading partner...'}
                    </h3>
                    <p className="text-[9px] text-slate-400 mt-0.5 truncate max-w-sm">
                      {partnerProfile?.experience || 'View Profile'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('profile', selectedPartnerId)}
                  className="rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-500/10 px-2.5 py-1 text-2xs font-bold hover:bg-indigo-900/45 transition"
                >
                  View Profile
                </button>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/30">
                {loadingMessages ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin mx-auto mb-2" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-450 space-y-3 max-w-xs mx-auto">
                    <MessageSquare className="w-8 h-8 text-slate-750 mx-auto" />
                    <p className="font-bold text-slate-200">Start the conversation!</p>
                    <p className="text-[10px] text-slate-400">Discuss availability, topics, and when you can swap skill sessions.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === currentUser.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-3.5 text-xs leading-normal ${
                            isMe 
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-950/20' 
                              : 'bg-slate-950 text-slate-200 rounded-bl-none border border-slate-850 shadow-md'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span className={`block text-[8px] font-mono mt-1.5 text-right ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex items-center space-x-2 bg-slate-900">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message to discuss your swap..."
                  className="block flex-1 rounded-xl border border-slate-800 bg-slate-955 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600"
                  id="chat-message-input"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-500 transition disabled:bg-slate-800 disabled:text-slate-650"
                  id="chat-send-btn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-750" />
              <p className="font-bold text-slate-200">Your Swapping Inbox</p>
              <p className="text-xs text-slate-400 max-w-xs">Select a registered community member from the active list to initiate a reciprocal swap chat!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
