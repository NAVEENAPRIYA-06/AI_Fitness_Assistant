/**
 * HealthPilot AI — Unified Date & Calendar Utility
 * Single source of truth for runtime calendar calculations, week ranges, and status derivations.
 * 
 * Guarantees:
 * - Runtime determination from local calendar (no hardcoded demo days).
 * - Safe date-only ISO strings (YYYY-MM-DD) avoiding UTC timezone shift bugs.
 * - Calendar-based week calculation (Monday through Sunday).
 * - Accurate day status calculation: date < today -> 'past', date === today -> 'today', date > today -> 'upcoming'.
 */

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const;

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

/**
 * Formats a Date object into a local 'YYYY-MM-DD' string.
 * Uses local year, month, and date to strictly prevent one-day UTC offsets.
 */
export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date key 'YYYY-MM-DD' in local time.
 */
export function getTodayDateKey(): string {
  return formatDateKey(new Date());
}

/**
 * Parses a 'YYYY-MM-DD' key into a Date object set to midday local time (12:00:00).
 * Midday avoids any DST boundary shifts.
 */
export function parseDateKey(dateKey: string): Date {
  if (!dateKey || typeof dateKey !== 'string') {
    return new Date();
  }
  const parts = dateKey.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  const fallback = new Date(dateKey);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

/**
 * Calculates the Monday 12:00:00 of the week containing the given reference date.
 * Week starts on Monday (index 1).
 */
export function getStartOfWeek(refDate: Date = new Date()): Date {
  const day = refDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToMonday = (day + 6) % 7;
  return new Date(
    refDate.getFullYear(),
    refDate.getMonth(),
    refDate.getDate() - diffToMonday,
    12,
    0,
    0
  );
}

export interface WeekDayInfo {
  date: string; // 'YYYY-MM-DD'
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  shortDay: string; // 'Mon', 'Tue', etc.
  dayOfMonth: number; // 7, 8, etc.
  monthName: string; // 'September'
  shortMonth: string; // 'Sep'
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  dateObj: Date;
}

/**
 * Returns all 7 calendar days of the current week (Monday through Sunday)
 * relative to the reference date.
 */
export function getWeekDates(refDate: Date = new Date()): WeekDayInfo[] {
  const monday = getStartOfWeek(refDate);
  const todayKey = getTodayDateKey();

  const days: WeekDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i,
      12,
      0,
      0
    );
    const dateKey = formatDateKey(d);
    const dayOfWeek = DAYS_OF_WEEK[d.getDay()];
    const shortDay = dayOfWeek.slice(0, 3);
    const dayOfMonth = d.getDate();
    const monthName = MONTH_NAMES[d.getMonth()];
    const shortMonth = SHORT_MONTH_NAMES[d.getMonth()];

    days.push({
      date: dateKey,
      dayOfWeek,
      shortDay,
      dayOfMonth,
      monthName,
      shortMonth,
      isToday: dateKey === todayKey,
      isPast: dateKey < todayKey,
      isFuture: dateKey > todayKey,
      dateObj: d
    });
  }

  return days;
}

/**
 * Derives day status based strictly on the calendar date vs current date.
 * Returns 'past', 'today', or 'upcoming'.
 */
export function getDayStatus(
  dateOrKey: string | Date,
  todayKey: string = getTodayDateKey()
): 'past' | 'today' | 'upcoming' {
  const targetKey = typeof dateOrKey === 'string'
    ? (dateOrKey.includes('T') ? dateOrKey.split('T')[0] : dateOrKey)
    : formatDateKey(dateOrKey);

  if (targetKey === todayKey) return 'today';
  if (targetKey < todayKey) return 'past';
  return 'upcoming';
}

/**
 * Checks if a date corresponds to today.
 */
export function isToday(dateOrKey: string | Date, todayKey: string = getTodayDateKey()): boolean {
  const targetKey = typeof dateOrKey === 'string'
    ? (dateOrKey.includes('T') ? dateOrKey.split('T')[0] : dateOrKey)
    : formatDateKey(dateOrKey);
  return targetKey === todayKey;
}

/**
 * Checks if a date is strictly in the past.
 */
export function isPast(dateOrKey: string | Date, todayKey: string = getTodayDateKey()): boolean {
  const targetKey = typeof dateOrKey === 'string'
    ? (dateOrKey.includes('T') ? dateOrKey.split('T')[0] : dateOrKey)
    : formatDateKey(dateOrKey);
  return targetKey < todayKey;
}

/**
 * Checks if a date is strictly in the future.
 */
export function isFuture(dateOrKey: string | Date, todayKey: string = getTodayDateKey()): boolean {
  const targetKey = typeof dateOrKey === 'string'
    ? (dateOrKey.includes('T') ? dateOrKey.split('T')[0] : dateOrKey)
    : formatDateKey(dateOrKey);
  return targetKey > todayKey;
}

/**
 * Derives Day of Week from any date string or Date object.
 */
export function getDayOfWeekFromDate(dateOrKey: string | Date): string {
  if (typeof dateOrKey === 'string') {
    // If it's already a valid weekday name, return it
    const trimmed = dateOrKey.trim();
    if (DAYS_OF_WEEK.includes(trimmed as any)) {
      return trimmed;
    }
    const d = parseDateKey(dateOrKey);
    return DAYS_OF_WEEK[d.getDay()];
  }
  return DAYS_OF_WEEK[dateOrKey.getDay()];
}

/**
 * Checks if an existing plan payload or days array belongs to a previous week
 * or has invalid/placeholder dates (e.g. 'Today', 'Tomorrow', etc.).
 */
export function isPlanWeekStale(
  days: Array<{ date?: string }>,
  refDate: Date = new Date()
): boolean {
  if (!Array.isArray(days) || days.length === 0) {
    return true;
  }

  const currentWeekDays = getWeekDates(refDate);
  const currentMondayKey = currentWeekDays[0].date;
  const currentSundayKey = currentWeekDays[6].date;

  // Check if any day has non-standard date string like 'Today' or 'In 2 days'
  const hasMalformedDates = days.some(d => !d.date || !/^\d{4}-\d{2}-\d{2}$/.test(d.date));
  if (hasMalformedDates) {
    return true;
  }

  // The plan's first day should match the current week's Monday
  const firstDayDate = days[0]?.date;
  if (firstDayDate !== currentMondayKey) {
    return true;
  }

  // Ensure dates are in current week range
  const allInWeek = days.every(d => d.date! >= currentMondayKey && d.date! <= currentSundayKey);
  return !allInWeek;
}

/**
 * User-friendly date formatting without raw ISO timestamps.
 * Examples:
 * - "Today, Fri, Sep 11"
 * - "Yesterday, Thu, Sep 10"
 * - "Wed, Sep 9"
 * - "Sat, Sep 12"
 */
export function formatUserFriendlyDate(
  dateOrTimestamp: string | Date,
  options: {
    includeWeekday?: boolean;
    relativePrefix?: boolean;
    includeTime?: boolean;
  } = {}
): string {
  if (!dateOrTimestamp) return '';

  const { includeWeekday = true, relativePrefix = true, includeTime = false } = options;
  const d = typeof dateOrTimestamp === 'string'
    ? (dateOrTimestamp.includes('T') ? new Date(dateOrTimestamp) : parseDateKey(dateOrTimestamp))
    : dateOrTimestamp;

  if (isNaN(d.getTime())) {
    return String(dateOrTimestamp);
  }

  const dateKey = formatDateKey(d);
  const todayKey = getTodayDateKey();

  // Determine yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  // Determine tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  let prefix = '';
  if (relativePrefix) {
    if (dateKey === todayKey) prefix = 'Today, ';
    else if (dateKey === yesterdayKey) prefix = 'Yesterday, ';
    else if (dateKey === tomorrowKey) prefix = 'Tomorrow, ';
  }

  const weekday = includeWeekday ? DAYS_OF_WEEK[d.getDay()].slice(0, 3) + ', ' : '';
  const month = SHORT_MONTH_NAMES[d.getMonth()];
  const day = d.getDate();

  let timeStr = '';
  if (includeTime && typeof dateOrTimestamp === 'string' && dateOrTimestamp.includes('T')) {
    const timeFormatted = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    timeStr = ` at ${timeFormatted}`;
  }

  return `${prefix}${weekday}${month} ${day}${timeStr}`;
}
