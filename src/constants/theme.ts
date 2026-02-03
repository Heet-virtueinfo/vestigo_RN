const Palette = {
  indigo600: '#4F46E5',
  indigo500: '#6366F1',
  indigo50: '#EEF2FF',

  gray900: '#111827',
  gray800: '#1F2937',
  gray700: '#374151',
  gray600: '#4B5563',
  gray500: '#6B7280',
  gray400: '#9CA3AF',
  gray300: '#D1D5DB',
  gray200: '#E5E7EB',
  gray100: '#F3F4F6',
  gray50: '#F9FAFB',

  white: '#FFFFFF',
  black: '#000000',

  // Charts & Accents
  cyan500: '#06b6d4',
  amber500: '#f59e0b',
  emerald500: '#10b981',
  violet500: '#8b5cf6',

  // Activities & Metrics
  blue500: '#3b82f6',
  purple500: '#a855f7',
  teal500: '#14b8a6',
  yellow500: '#eab308',
  yellow600: '#ca8a04',

  // Status (Green)
  green500: '#22c55e',
  green600: '#16a34a',
  green100: '#dcfce7',
  green800: '#166534',

  // Status (Red)
  red500: '#ef4444',
  red600: '#dc2626',
  red100: '#fee2e2',
  red800: '#991b1b',

  // Status (Yellow/Warning)
  yellow100: '#fef9c3',
  yellow800: '#854d0e',
};

export const Colors = {
  light: {
    primary: Palette.indigo600,
    background: Palette.gray50,
    card: Palette.white,
    text: Palette.gray900,
    textMuted: Palette.gray500,
    border: Palette.gray300,
    icon: Palette.gray500,
    error: Palette.red500,

    // Specific UI elements
    inputBackground: Palette.white,
    inputBorder: Palette.gray300,

    // Navigation
    tabBarActive: Palette.indigo600,
    tabBarInactive: Palette.gray400,
    tabBarBackground: Palette.white,
    tabBarBorder: Palette.gray200,

    // Dashboard & Widgets
    charts: [
      Palette.indigo600,
      Palette.cyan500,
      Palette.amber500,
      Palette.emerald500,
      Palette.violet500,
    ],

    // Semantic Colors
    success: Palette.green500,
    warning: Palette.yellow500,
    danger: Palette.red500,
    info: Palette.blue500,

    // Activity Colors
    activity: {
      call: Palette.blue500,
      meeting: Palette.purple500,
      note: Palette.teal500,
      email: Palette.yellow500,
    },

    // Badges (Backgrounds & Text)
    badge: {
      success: { bg: Palette.green100, text: Palette.green800 },
      warning: { bg: Palette.yellow100, text: Palette.yellow800 },
      danger: { bg: Palette.red100, text: Palette.red800 },
      default: { bg: Palette.gray100, text: Palette.gray800 },
    },

    // Metric Accents
    accent: {
      blue: Palette.blue500,
      purple: Palette.purple500,
      green: Palette.green600,
      red: Palette.red600,
      yellow: Palette.yellow600,
      teal: Palette.teal500,
    },
  },
  dark: {
    primary: Palette.indigo500,
    background: Palette.gray900,
    card: Palette.gray800,
    text: Palette.gray100,
    textMuted: Palette.gray400,
    border: Palette.gray700,
    icon: Palette.gray400,
    error: Palette.red500,

    // Specific UI elements
    inputBackground: Palette.gray800,
    inputBorder: Palette.gray700,

    // Navigation
    tabBarActive: Palette.indigo500,
    tabBarInactive: Palette.gray600,
    tabBarBackground: Palette.gray900,
    tabBarBorder: Palette.gray800,

    // Dashboard & Widgets
    charts: [
      Palette.indigo500,
      Palette.cyan500,
      Palette.amber500,
      Palette.emerald500,
      Palette.violet500,
    ],

    // Semantic Colors
    success: Palette.green500,
    warning: Palette.yellow500,
    danger: Palette.red500,
    info: Palette.blue500,

    // Activity Colors
    activity: {
      call: Palette.blue500,
      meeting: Palette.purple500,
      note: Palette.teal500,
      email: Palette.yellow500,
    },

    // Badges (Dark Mode - using darker backgrounds or staying same?
    // Usually inverted: dark bg, light text. But for now keeping simple mapping or adjusting)
    // For simplicity and visibility, using semi-transparent or slightly adjusted colors
    badge: {
      success: { bg: '#064e3b', text: '#dcfce7' }, // emerald-900 / emerald-100
      warning: { bg: '#451a03', text: '#fef9c3' }, // amber-950 / yellow-100
      danger: { bg: '#7f1d1d', text: '#fee2e2' }, // red-900 / red-100
      default: { bg: Palette.gray800, text: Palette.gray200 },
    },

    // Metric Accents (Same as light or slightly adjusted)
    accent: {
      blue: Palette.blue500,
      purple: Palette.purple500,
      green: Palette.green600,
      red: Palette.red600,
      yellow: Palette.yellow600,
      teal: Palette.teal500,
    },
  },
};

export default Colors;
