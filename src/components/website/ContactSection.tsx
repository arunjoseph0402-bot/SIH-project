import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  MapPin, 
  Mail, 
  FileCode, 
  Radio,
  Terminal,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ContactSectionProps {
  onOpenConsole: () => void;
}

export function ContactSection({ onOpenConsole }: ContactSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    application: 'Test Tank Validation & Academic Research',
    depthTarget: '0m - 25m (Shallow Benthic Test Tank)',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-[#060709] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left 5 Columns: Info & Deployment Request */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-sans text-neutral-300 mb-4">
                <Radio size={13} className="text-cyan-400 animate-pulse" />
                <span>Field Collaboration & CAD Trials</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-sans font-semibold text-white tracking-tight leading-[1.15]">
                Request Prototype Deployment or 3D CAD Data
              </h2>
              
              <p className="mt-4 text-sm text-neutral-400 font-sans leading-relaxed">
                We collaborate with student engineering teams, marine research labs, and ocean tech developers to deploy the AUV-9 prototype for bathymetric validation and software-defined acoustic payload experiments.
              </p>

              {/* Contact Information Points */}
              <div className="mt-8 space-y-3 font-sans text-xs text-neutral-300">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">Test Facility</span>
                    <span className="text-white font-medium">Marine Robotics Flume & Test Basin</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400 shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">Direct Inquiries</span>
                    <span className="text-white font-medium">auv9-team@subsea-robotics.org</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 shrink-0">
                    <FileCode size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">Open Source CAD</span>
                    <span className="text-white font-medium">STLs, Three.js Digital Twin & STM32 Firmware</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button to Operator Console */}
            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-white block">Ready to test telemetry?</span>
                  <span className="text-[11px] text-neutral-400">Launch the full operator console instantly.</span>
                </div>
                <button
                  onClick={onOpenConsole}
                  className="px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold tracking-tight transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Terminal size={12} />
                  <span>Launch Console</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Form inside sleek card */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.6)]">
            {submitted ? (
              <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-xl font-sans font-semibold text-white">
                  Deployment Request Logged
                </h3>
                <p className="text-xs text-neutral-400 font-sans max-w-md leading-relaxed">
                  Thank you for your interest in AUV-9. Our student engineering team has received your test parameters and will respond within 24 hours with CAD STLs and bench trial data.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-all"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    Request Trial Deployment & CAD
                  </h3>
                  <p className="text-xs text-neutral-400 mb-5">
                    Submit your organization details to download complete 3D-printable STLs or schedule a tank trial.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1.5 font-medium">FULL NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#08090d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1.5 font-medium">INSTITUTION EMAIL *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@university.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#08090d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1.5 font-medium">ORGANIZATION / LAB</label>
                    <input
                      type="text"
                      placeholder="e.g. Marine Robotics Group"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full bg-[#08090d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1.5 font-medium">PRIMARY USE CASE</label>
                    <select
                      value={formData.application}
                      onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                      className="w-full bg-[#08090d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    >
                      <option value="Test Tank Validation & Academic Research">Test Tank Validation & Research</option>
                      <option value="Benthic Reef & Environmental Survey">Benthic Reef Survey</option>
                      <option value="Offshore Infrastructure & Scour">Offshore Infrastructure Scour</option>
                      <option value="Custom Sonar Payload Integration">Custom Sonar Payload Integration</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1.5 font-medium">PROJECT OBJECTIVES & REQUIREMENTS</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your test basin dimensions, target bathymetric swath, or custom sensor payload..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#08090d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
                >
                  <Send size={13} />
                  <span>Submit Deployment Request</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
