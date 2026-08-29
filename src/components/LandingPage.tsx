/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowRight, HeartHandshake, Award, Search, MessageCircle, CalendarDays, RefreshCw, Star 
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-indigo-950/20 via-slate-950 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Tagline pill */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-950/40 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/20 mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>LEARN. TEACH. GROW TOGETHER.</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              variants={itemVariants}
              className="font-sans text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.1]"
            >
              The Peer-to-Peer <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent animate-pulse duration-[8000ms]">
                Skill Swap Community
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              variants={itemVariants}
              className="mt-6 font-sans text-base leading-8 text-slate-300"
            >
              SkillBridge connects people with knowledge to people who want to learn. No fees, no pre-recorded video logs, no premium paywalls. Just pure human-to-human collaboration. Teach what you love, learn what you need.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              variants={itemVariants}
              className="mt-10 flex items-center justify-center gap-x-4"
            >
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-950/50 hover:bg-indigo-500 active:scale-95 transition"
                id="landing-hero-join-btn"
              >
                <span>Create Your Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onNavigate('login')}
                className="rounded-xl border border-slate-850 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
                id="landing-hero-login-btn"
              >
                Log In
              </button>
            </motion.div>

            {/* Platform statistics */}
            <motion.div 
              variants={itemVariants}
              className="mt-14 grid grid-cols-3 gap-y-4 border-t border-slate-800/60 pt-8 sm:grid-cols-3 text-center"
            >
              <div>
                <p className="font-sans text-3xl font-bold tracking-tight text-slate-100">100%</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Free to Swap</p>
              </div>
              <div>
                <p className="font-sans text-3xl font-bold tracking-tight text-slate-100">1-on-1</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Live Sessions</p>
              </div>
              <div>
                <p className="font-sans text-3xl font-bold tracking-tight text-slate-100">4.9 ★</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Avg Swap Rating</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Core Loop Model */}
      <section className="bg-slate-900/30 py-20 border-y border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How Skill Swapping Works
            </h2>
            <p className="mt-4 font-sans text-base text-slate-400">
              Unlike traditional courses, SkillBridge is structured as a reciprocal knowledge swap.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/20 mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-sans text-base font-bold text-slate-100">Add Your Skills</h3>
              <p className="mt-2 font-sans text-xs text-slate-400 leading-relaxed">
                List the skills you excel at ("Can Teach") and the ones you want to acquire ("Want To Learn").
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/20 mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-sans text-base font-bold text-slate-100">Search for Partners</h3>
              <p className="mt-2 font-sans text-xs text-slate-400 leading-relaxed">
                Find people who possess the skill you want, and who are looking to learn what you can teach.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/20 mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-sans text-base font-bold text-slate-100">Send a Request</h3>
              <p className="mt-2 font-sans text-xs text-slate-400 leading-relaxed">
                Propose a topic, preferred date, and description. Once accepted, a calendar event is scheduled.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/20 mb-4 font-bold text-lg">
                4
              </div>
              <h3 className="font-sans text-base font-bold text-slate-100">Swap & Review</h3>
              <p className="mt-2 font-sans text-xs text-slate-400 leading-relaxed">
                Meet live on Google Meet, swap knowledge, mark complete, and leave feedback to update profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reciprocal Example Card */}
      <section className="py-20 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl bg-slate-900 rounded-3xl border border-slate-800/80 p-8 sm:p-12 shadow-2xl shadow-black/40">
            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-slate-800/80 gap-8 items-center">
              {/* User 1 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-emerald-500/20">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" alt="Gokul" className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-sans text-lg font-bold text-slate-100">Gokul</h4>
                    <p className="text-xs text-slate-400">Senior Java Developer</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Can Teach</p>
                    <p className="font-sans text-sm font-semibold text-emerald-200 mt-1">Java / Spring</p>
                  </div>
                  <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/10 p-3">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">Wants to Learn</p>
                    <p className="font-sans text-sm font-semibold text-indigo-200 mt-1">React / UX</p>
                  </div>
                </div>
              </div>

              {/* User 2 */}
              <div className="space-y-4 md:pl-8">
                <div className="flex items-center space-x-3.5">
                  <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-indigo-500/20">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Priya" className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-sans text-lg font-bold text-slate-100">Priya</h4>
                    <p className="text-xs text-slate-400">Frontend Specialist</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Can Teach</p>
                    <p className="font-sans text-sm font-semibold text-emerald-200 mt-1">React / Design</p>
                  </div>
                  <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/10 p-3">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">Wants to Learn</p>
                    <p className="font-sans text-sm font-semibold text-indigo-200 mt-1">Python Backend</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Swap visualizer */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-800/60 pt-8 text-center text-sm font-semibold text-slate-400">
              <span className="flex items-center space-x-1">
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Gokul teaches Priya Java & Spring Boot</span>
              </span>
              <span className="hidden sm:inline text-slate-700">•</span>
              <span className="flex items-center space-x-1">
                <RefreshCw className="w-4 h-4 text-violet-400" />
                <span>Priya teaches Gokul React & Design</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg">
              S
            </div>
            <span className="font-sans text-lg font-bold text-white tracking-tight">SkillBridge</span>
          </div>
          <p className="text-xs text-slate-500 text-center md:text-left">
            © 2026 SkillBridge. Learn. Teach. Grow Together. Dedicated to free community peer mentorship.
          </p>
        </div>
      </footer>
    </div>
  );
}
