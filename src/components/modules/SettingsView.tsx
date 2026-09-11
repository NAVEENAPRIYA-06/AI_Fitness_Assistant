import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  User,
  Settings2,
  Server,
  Cpu,
  Brain,
  Sparkles,
  Save,
  Check,
  Shield,
  Layers
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile } = useHealthPilot();

  const [name, setName] = useState(profile?.name || 'Alex Vance');
  const [age, setAge] = useState(profile?.age || 29);
  const [heightCm, setHeightCm] = useState(profile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState(profile?.weightKg || 74);
  const [fitnessLevel, setFitnessLevel] = useState(profile?.fitnessLevel || 'intermediate');
  const [targetWeeklyWorkouts, setTargetWeeklyWorkouts] = useState(profile?.targetWeeklyWorkouts || 4);
  const [isSaved, setIsSaved] = useState(false);

  // Calculate live BMI
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '23.3';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      age,
      heightCm,
      weightKg,
      fitnessLevel: fitnessLevel as any,
      targetWeeklyWorkouts
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
            <Settings2 className="w-4 h-4 inline mr-1 text-emerald-400" />
            Configuration & Architecture
          </span>
          <span className="text-xs text-slate-500 font-mono">System Integrity</span>
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">
          User Profile & System Architecture
        </h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Manage your baseline biometrics and inspect the research system architecture powering the decision engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Profile Form */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSaveProfile} className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>User Biometrics & Parameters</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                BMI: {bmi} (Healthy)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-800 bg-slate-900 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-800 bg-slate-900 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-800 bg-slate-900 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-800 bg-slate-900 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Fitness Level</label>
                <select
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-800 bg-slate-900 text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced / Athletic</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Weekly Workouts</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={targetWeeklyWorkouts}
                  onChange={(e) => setTargetWeeklyWorkouts(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-800 bg-slate-900 text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <div>
                {isSaved && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    Profile Updated Successfully
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-[#0A0A0B] bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: System Architecture & Research Integrity */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-3.5 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Modular System Architecture</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Decision Intelligence Engine</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Multi-domain state synthesis, goal-condition conflict detection, and candidate recommendation ranking.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ML Service Bridge</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                    Analytical Local
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Feature-weighted empirical attribution engine with modular Python microservice HTTP bridge support.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gemini AI Coach</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Server-side conversational reasoning grounded in physiological metrics and SHAP explainability factors.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Privacy & Key Security</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Zero Client Exposure</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  All AI and model operations execute strictly in server-side API proxy routes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
