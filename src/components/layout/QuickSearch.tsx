import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Compass,
  Sliders,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  Brain,
  History,
  Target,
  AlertTriangle,
  Layers,
  HelpCircle,
  Sparkles,
  Settings2,
  Activity,
  X,
  ArrowRight
} from 'lucide-react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: 'today',
    title: 'Today',
    description: 'Your daily recommended workout, recovery readiness, and alternatives',
    icon: Compass,
    keywords: ['today', 'workout', 'recommendation', 'daily', 'exercise', 'training', 'routine', 'home', 'movement', 'readiness', 'stretch']
  },
  {
    id: 'context',
    title: 'My Context',
    description: 'Check in with your sleep, energy, fatigue, soreness, and schedule',
    icon: Sliders,
    keywords: ['context', 'my context', 'sleep', 'energy', 'fatigue', 'soreness', 'available time', 'check in', 'recovery', 'stress', 'location', 'equipment']
  },
  {
    id: 'adaptive_plan',
    title: 'Adaptive Plan',
    description: 'View and adjust your weekly fitness plan',
    icon: CalendarDays,
    keywords: ['adaptive plan', 'plan', 'workout', 'week', 'schedule', 'weekly', 'calendar', 'rest day', 'adaptive', 'adjustments']
  },
  {
    id: 'journal',
    title: 'Outcome Journal',
    description: 'Log completed workouts, active duration, effort, and reflections',
    icon: CheckCircle2,
    keywords: ['outcome journal', 'journal', 'log', 'completed', 'workout', 'activity', 'history', 'effort', 'rpe', 'reflection']
  },
  {
    id: 'progress',
    title: 'Progress',
    description: 'Track your consistency, active minutes, and milestone achievements',
    icon: TrendingUp,
    keywords: ['progress', 'stats', 'active minutes', 'streak', 'consistency', 'milestones', 'adherence', 'trends']
  },
  {
    id: 'insights',
    title: 'Behavior Insights',
    description: 'Discover your optimal duration, peak time of day, and completion factors',
    icon: Brain,
    keywords: ['behavior insights', 'insights', 'patterns', 'habits', 'progress', 'optimal duration', 'best time', 'routine', 'adherence']
  },
  {
    id: 'history',
    title: 'Recommendation History',
    description: 'Timeline of past workout recommendations and recovery snapshots',
    icon: History,
    keywords: ['recommendation history', 'history', 'past', 'audit trail', 'activity', 'progress', 'previous workouts']
  },
  {
    id: 'goals',
    title: 'Goal Strategy',
    description: 'Manage your primary targets, milestones, and strategic targets',
    icon: Target,
    keywords: ['goal strategy', 'goal', 'goals', 'targets', 'milestones', 'strategy', 'strength goal', 'endurance', 'weight']
  },
  {
    id: 'conflicts',
    title: 'Goal Conflicts',
    description: 'See how your plan protects recovery when fatigue conflicts with goals',
    icon: AlertTriangle,
    keywords: ['goal conflicts', 'conflicts', 'goal', 'buffer', 'fatigue', 'overtraining', 'recovery vs goals', 'adjustment']
  },
  {
    id: 'plan_lab',
    title: 'Plan Lab',
    description: 'Explore alternative workout candidates and compare suitabilities',
    icon: Layers,
    keywords: ['plan lab', 'alternatives', 'workout', 'compare', 'options', 'candidates', 'interventions', 'swap']
  },
  {
    id: 'what_if',
    title: 'What-If Lab',
    description: 'Simulate how changes in sleep, time, or energy adjust your workout',
    icon: HelpCircle,
    keywords: ['what if', 'what-if lab', 'simulation', 'simulator', 'sleep', 'time', 'energy', 'scenario']
  },
  {
    id: 'coach',
    title: 'HealthPilot Coach',
    description: 'Chat with your AI coach for personalized advice and plan adjustments',
    icon: Sparkles,
    keywords: ['healthpilot coach', 'coach', 'ask coach', 'ai coach', 'chat', 'questions', 'advice', 'guidance', 'tips']
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Manage your profile, biometrics, preferences, and theme',
    icon: Settings2,
    keywords: ['settings', 'preferences', 'profile', 'account', 'biometrics', 'theme', 'appearance', 'light mode', 'dark mode']
  },
  {
    id: 'evaluation',
    title: 'Research & Evaluation',
    description: 'Review machine learning evaluation metrics, feature weights, and telemetry',
    icon: Activity,
    keywords: ['evaluation', 'research', 'ml', 'metrics', 'models', 'accuracy', 'internal', 'telemetry']
  }
];

export const QuickSearch: React.FC = () => {
  const { setActiveModule } = useHealthPilot();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter and rank results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const scored = SEARCH_ITEMS.map(item => {
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      let score = 0;

      // Exact title match
      if (titleLower === q) score += 100;
      // Title starts with query
      else if (titleLower.startsWith(q)) score += 80;
      // Title contains query
      else if (titleLower.includes(q)) score += 40;

      // Check keywords
      for (const kw of item.keywords) {
        if (kw === q) {
          score += 90;
          break;
        } else if (kw.startsWith(q)) {
          score += 60;
          break;
        } else if (kw.includes(q)) {
          score += 30;
          break;
        }
      }

      // Description contains query
      if (descLower.includes(q)) {
        score += 15;
      }

      return { item, score };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item)
    .slice(0, 6); // Cap at 6 results

    return scored;
  }, [query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchItem) => {
    setActiveModule(item.id);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (filteredResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    }
  };

  const hasTyped = query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm sm:max-w-md">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search pages and features..."
          aria-label="Search pages and features"
          aria-expanded={isOpen}
          role="combobox"
          aria-autocomplete="list"
          className="w-full pl-9 pr-9 py-1.5 sm:py-2 text-xs rounded-full bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && hasTyped && (
        <div className="absolute left-0 right-0 mt-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {filteredResults.length > 0 ? (
            <div className="p-1.5 space-y-0.5 max-h-80 overflow-y-auto">
              {filteredResults.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                        : 'hover:bg-[var(--surface-soft)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                          {item.title}
                        </span>
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 ml-1.5" />
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-6 px-4 text-center">
              <p className="text-xs font-medium text-[var(--text-muted)]">
                No matching pages or features
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
