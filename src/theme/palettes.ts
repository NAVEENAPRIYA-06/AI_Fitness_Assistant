/**
 * HEALTHPILOT AI — THEME PALETTES CONFIGURATION
 *
 * Active Palette: "Coral Wellness"
 * Fallback / Legacy Palette: "Fresh Wellness"
 *
 * To easily revert from Coral Wellness back to Fresh Wellness, replace the CSS variables
 * in src/index.css with the FRESH_WELLNESS tokens below or change the ACTIVE_PALETTE.
 */

export interface ThemePaletteTokens {
  name: string;
  id: 'coral-wellness' | 'fresh-wellness';
  description: string;
  light: {
    background: string;
    surface: string;
    surfaceElevated: string;
    surfaceSoft: string;
    surfaceCard: string;
    primary: string;
    primaryHover: string;
    primarySoft: string;
    primaryGlow: string;
    peach?: string;
    peachSoft?: string;
    peachMuted?: string;
    secondary: string;
    secondarySoft: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerSoft: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderSubtle: string;
  };
  dark: {
    background: string;
    surface: string;
    surfaceElevated: string;
    surfaceSoft: string;
    surfaceCard: string;
    primary: string;
    primaryHover: string;
    primarySoft: string;
    primaryGlow: string;
    peach?: string;
    peachSoft?: string;
    peachMuted?: string;
    secondary: string;
    secondarySoft: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerSoft: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderSubtle: string;
  };
}

/**
 * ACTIVE BRAND PALETTE: Coral Wellness
 * Warm, modern, premium, calm, wellness-oriented palette.
 */
export const CORAL_WELLNESS: ThemePaletteTokens = {
  name: 'Coral Wellness',
  id: 'coral-wellness',
  description: 'Warm coral and gentle peach wellness palette with distinct semantic status colors',
  light: {
    background: '#FFF9F7',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceSoft: '#FFF1EC', // Peach subtle surface
    surfaceCard: '#FFFFFF',
    primary: '#F26B5E', // Coral brand accent
    primaryHover: '#E85A4F',
    primarySoft: '#FDE8E5', // Soft coral
    primaryGlow: 'rgba(242, 107, 94, 0.20)',
    peach: '#FFF1EC',
    peachSoft: '#FFF7F4',
    secondary: '#0284C7', // Calm blue info
    secondarySoft: 'rgba(2, 132, 199, 0.12)',
    success: '#10B981', // Semantic status green
    successSoft: 'rgba(16, 185, 129, 0.12)',
    warning: '#D97706', // Semantic status amber
    warningSoft: 'rgba(217, 119, 6, 0.12)',
    danger: '#EF4444', // Semantic status red
    dangerSoft: 'rgba(239, 68, 68, 0.12)',
    textPrimary: '#1F2933', // Main text
    textSecondary: '#667085', // Secondary text
    textMuted: '#8E98A8',
    border: '#E7D8D4', // Border
    borderSubtle: 'rgba(231, 216, 212, 0.6)'
  },
  dark: {
    background: '#171414',
    surface: '#201B1A',
    surfaceElevated: '#282120',
    surfaceSoft: '#282120', // Secondary surface
    surfaceCard: '#201B1A',
    primary: '#FF7A6E', // Primary coral dark
    primaryHover: '#FF6455',
    primarySoft: 'rgba(255, 122, 110, 0.16)', // Soft coral dark
    primaryGlow: 'rgba(255, 122, 110, 0.25)',
    peach: '#2E2322',
    peachMuted: '#F6C7BE',
    secondary: '#38BDF8',
    secondarySoft: 'rgba(56, 189, 248, 0.12)',
    success: '#34D399',
    successSoft: 'rgba(52, 211, 153, 0.15)',
    warning: '#F59E0B',
    warningSoft: 'rgba(245, 158, 11, 0.15)',
    danger: '#F87171',
    dangerSoft: 'rgba(248, 113, 113, 0.15)',
    textPrimary: '#F9F5F3',
    textSecondary: '#B8AAA6',
    textMuted: '#847773',
    border: '#403330',
    borderSubtle: 'rgba(255, 255, 255, 0.08)'
  }
};

/**
 * RECOVERABLE FALLBACK PALETTE: Fresh Wellness (Previous Mint/Green Theme)
 * Kept intact so that it can be restored anytime with zero functional risk.
 */
export const FRESH_WELLNESS_FALLBACK: ThemePaletteTokens = {
  name: 'Fresh Wellness',
  id: 'fresh-wellness',
  description: 'Classic mint and fresh green wellness palette',
  light: {
    background: '#F5F8F7',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceSoft: '#EDF3F1',
    surfaceCard: '#FFFFFF',
    primary: '#159A6A',
    primaryHover: '#118359',
    primarySoft: 'rgba(21, 154, 106, 0.12)',
    primaryGlow: 'rgba(21, 154, 106, 0.20)',
    secondary: '#3B82F6',
    secondarySoft: 'rgba(59, 130, 246, 0.12)',
    success: '#10B981',
    successSoft: 'rgba(16, 185, 129, 0.12)',
    warning: '#C98A18',
    warningSoft: 'rgba(201, 138, 24, 0.12)',
    danger: '#DC5A5A',
    dangerSoft: 'rgba(220, 90, 90, 0.12)',
    textPrimary: '#17201D',
    textSecondary: '#53615C',
    textMuted: '#7A8782',
    border: '#E0E8E5',
    borderSubtle: 'rgba(0, 0, 0, 0.06)'
  },
  dark: {
    background: '#0D1110',
    surface: '#121918',
    surfaceElevated: '#17201E',
    surfaceSoft: '#1B2523',
    surfaceCard: '#141C1A',
    primary: '#35D399',
    primaryHover: '#2CCB91',
    primarySoft: 'rgba(53, 211, 153, 0.12)',
    primaryGlow: 'rgba(53, 211, 153, 0.22)',
    secondary: '#60A5FA',
    secondarySoft: 'rgba(96, 165, 250, 0.12)',
    success: '#34D399',
    successSoft: 'rgba(52, 211, 153, 0.15)',
    warning: '#F5B84B',
    warningSoft: 'rgba(245, 184, 75, 0.12)',
    danger: '#F87171',
    dangerSoft: 'rgba(248, 113, 113, 0.12)',
    textPrimary: '#F4F7F6',
    textSecondary: '#B7C2BE',
    textMuted: '#7F8B87',
    border: '#222E2B',
    borderSubtle: 'rgba(255, 255, 255, 0.08)'
  }
};

export const CURRENT_PALETTE = CORAL_WELLNESS;
