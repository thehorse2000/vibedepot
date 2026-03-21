'use client';

import React, { useState, useEffect } from 'react';
import { Geist } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const words = ["launching", "building", "running"];

function FlipWords() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-flex flex-col align-bottom overflow-visible font-black italic">
      {/* This span provides the dynamic width for the layout */}
      <span className="invisible pointer-events-none whitespace-nowrap px-1">
        {words[index]}
      </span>
      {words.map((word, i) => (
        <span
          key={word}
          className={`absolute left-0 transition-all duration-500 ease-in-out whitespace-nowrap px-1 ${
            i === index 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
          style={{ color: '#6366f1' }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export default function Home() {
  return (
    <div className={`${geistSans.variable} font-sans min-h-screen bg-white text-zinc-900 selection:bg-indigo-100`}>
      {/* Navigation */}
      <nav className="border-b border-zinc-100 py-6">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="text-xl font-bold tracking-tight flex items-center">
            <span style={{ color: '#6366f1' }}>Vibe</span>Depot
          </div>
          <div className="flex gap-8 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-zinc-900 transition-colors">App Registry</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Docs</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">GitHub</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-32 px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 bg-linear-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent leading-[1.1]">
          The Desktop App Store <br/>for the AI Era
        </h1>
        <p className="text-xl md:text-2xl text-zinc-500 mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
          Stop prompting models. <br/>
          Start <FlipWords /> apps.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            className="text-white px-10 py-5 rounded-xl font-bold hover:brightness-110 transition-all shadow-xl shadow-indigo-100"
            style={{ backgroundColor: '#6366f1' }}
          >
            Download the Shell
          </button>
          <button className="bg-white border-2 border-zinc-100 text-zinc-600 px-10 py-5 rounded-xl font-bold hover:bg-zinc-50 transition-all">
            Browse the App Registry
          </button>
        </div>
      </header>

      {/* Core Concept Section */}
      <section className="bg-zinc-50 py-32 px-6 border-y border-zinc-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10 tracking-tight">Functional Apps, Not Just Chatbots</h2>
          <p className="text-zinc-500 text-xl leading-relaxed max-w-3xl mx-auto font-medium">
            VibeDepot is a lightweight desktop shell that serves as the runtime container for AI-native applications. 
            Instead of copy-pasting code from a chat window, you install fully-featured tools for your desktop—from 
            SQL builders and PDF summarizers to meeting note assistants.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20">
          {[
            {
              title: "App Store Experience",
              desc: "Discover, install, and update AI utilities from a curated, community-driven registry.",
              icon: "🛍️"
            },
            {
              title: "Disposable Software",
              desc: "Launch lightweight \"VibeApps\"—static web bundles designed to do one task perfectly.",
              icon: "📦"
            },
            {
              title: "Local Runner",
              desc: "Every app is installed on your machine and opens in a secure, high-performance window.",
              icon: "💻"
            }
          ].map((f, i) => (
            <div key={i} className="p-10 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:border-indigo-200 transition-all">
              <div className="text-4xl mb-6">{f.icon}</div>
              <h3 className="font-bold text-xl mb-3 tracking-tight">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BYOK Section */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 tracking-tight">Your Keys, Your Infrastructure</h2>
            <p className="text-zinc-500 text-lg leading-relaxed mb-10 font-medium">
              We don&rsquo;t provide the AI; we provide the <strong>secure home</strong> for it. 
              VibeDepot allows you to bring your own provider credentials to any app you install.
            </p>
            <div className="space-y-6">
              {[
                { title: "BYOK (Bring Your Own Key)", desc: "Connect your existing Anthropic, OpenAI, or Gemini API keys once at setup." },
                { title: "Zero-Knowledge Security", desc: "Your keys are stored exclusively in your OS Keychain—apps only see responses." },
                { title: "Cost Transparency", desc: "Pay only for the tokens you actually use, directly to your provider." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 mb-1">{item.title}</h4>
                    <p className="text-zinc-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-zinc-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="text-indigo-400 font-mono mb-4 tracking-widest text-xs uppercase font-bold italic">Secure Bridge API</div>
              <div className="text-3xl font-bold mb-6 italic tracking-tight leading-tight">
                &ldquo;Because software is now disposable, you need a permanent home to run it safely.&rdquo;
              </div>
              <div className="h-[1px] bg-zinc-800 w-full my-8" />
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono">Anthropic</div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono">OpenAI</div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono">Gemini</div>
              </div>
            </div>
            {/* Background Accent */}
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
          </div>
        </div>
      </section>

      {/* Open Source & Sandbox */}
      <section className="py-32 bg-zinc-900 text-white overflow-hidden border-y border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 tracking-tight">100% Open-Source & Private</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "The Shell",
                desc: "A fully open-source Electron runtime that you control and audit.",
                icon: "🐚"
              },
              {
                title: "The Registry",
                desc: "A decentralized catalog of apps hosted on GitHub and maintained by the community.",
                icon: "🌍"
              },
              {
                title: "The Sandbox",
                desc: "Isolated secure containers with a restricted Bridge API for system protection.",
                icon: "🛡️"
              }
            ].map((f, i) => (
              <div key={i} className="group">
                <div className="text-5xl mb-8 grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110 duration-500">{f.icon}</div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OS Grid Section */}
      <section className="py-32 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8 tracking-tight">Run Everywhere</h2>
        <p className="text-zinc-500 text-xl mb-20 max-w-2xl mx-auto font-medium">
          AI-native software shouldn&rsquo;t be limited to the browser. VibeDepot provides a native experience across all major platforms.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { os: "macOS", desc: "Version 12.0+ (Apple Silicon & Intel)" },
            { os: "Windows", desc: "Windows 10 (Build 19041+)" },
            { os: "Linux", desc: "Ubuntu 20.04+ (AppImage & .deb)" }
          ].map((item, i) => (
            <div key={i} className="p-8 border-2 border-zinc-100 rounded-3xl hover:border-indigo-100 transition-all">
              <h3 className="font-bold text-xl mb-3">{item.os}</h3>
              <p className="text-zinc-500 text-sm font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-40 bg-zinc-50 border-t border-zinc-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter italic">Join the AI Native Desktop Revolution</h2>
          <p className="text-zinc-500 mb-12 text-xl max-w-lg mx-auto font-medium leading-relaxed">Download VibeDepot today and start launching functional apps locally.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
            <button 
              className="text-white px-12 py-5 rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
              style={{ backgroundColor: '#6366f1' }}
            >
              Get the Shell
            </button>
            <button className="bg-white border-2 border-zinc-200 text-zinc-600 px-12 py-5 rounded-xl font-bold hover:bg-zinc-100 transition-all">
              View on GitHub
            </button>
          </div>
          <div className="text-zinc-400 text-sm font-medium tracking-widest uppercase">
            &copy; 2026 VibeDepot // MIT License // Open Source
          </div>
        </div>
        {/* Background Decorative Blob */}
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 blur-[120px] rounded-full opacity-10"
          style={{ backgroundColor: '#6366f1' }}
        />
      </footer>
    </div>
  );
}
