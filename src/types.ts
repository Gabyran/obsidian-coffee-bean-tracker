export interface CoffeeBean {
  id: string;
  name: string;
  image: string;
  origin: string;
  process: string;
  variety: string;
  roaster: string;
  price: number;
  totalWeight: number;
  remaining: number;
  rating: number;
  ratingLabel: string;
  flavor: string;
  comment: string;
  purchaseDate: string;
  roastDate: string;
  openedDate: string;
  deductionPreset: DeductionPreset;
  archived: boolean;
}

export interface ConsumptionRecord {
  id: string;
  beanId: string;
  amount: number;
  presetLabel: string;
  timestamp: string;
}

export interface DeductionPreset {
  label: string;
  amount: number;
}

export interface NormalizedRating {
  value: number;
  label: string;
}

export interface CoffeeTrackerSettings {
  presets: DeductionPreset[];
  defaultView: 'kanban' | 'table';
  showArchived: boolean;
  displayPrecision: number;
}

export interface CoffeeTrackerData {
  settings: CoffeeTrackerSettings;
  beans: CoffeeBean[];
  history: ConsumptionRecord[];
}

export const DEFAULT_DEDUCTION_PRESET: DeductionPreset = {
  label: '单杯',
  amount: 15,
};

export const SETTLEMENT_PRESET_LABEL = '平账归档';
export const DEFAULT_RATING = 7;
export const MIN_RATING = 0;
export const MAX_RATING = 10;
export const DEFAULT_DISPLAY_PRECISION = 2;
export const MIN_DISPLAY_PRECISION = 0;
export const MAX_DISPLAY_PRECISION = 4;

export const DEFAULT_SETTINGS: CoffeeTrackerSettings = {
  presets: [
    DEFAULT_DEDUCTION_PRESET,
    { label: '双杯', amount: 30 },
  ],
  defaultView: 'kanban',
  showArchived: false,
  displayPrecision: DEFAULT_DISPLAY_PRECISION,
};

export const DEFAULT_DATA: CoffeeTrackerData = {
  settings: DEFAULT_SETTINGS,
  beans: [],
  history: [],
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function normalizeDeductionPreset(
  preset: Partial<DeductionPreset> | null | undefined,
  fallback: DeductionPreset = DEFAULT_DEDUCTION_PRESET,
): DeductionPreset {
  const rawLabel = typeof preset?.label === 'string' ? preset.label.trim() : '';
  const fallbackLabel = fallback.label.trim() || DEFAULT_DEDUCTION_PRESET.label;
  const label = rawLabel || fallbackLabel;

  const rawAmount = Number(preset?.amount);
  const fallbackAmount = Number.isFinite(fallback.amount) && fallback.amount > 0
    ? fallback.amount
    : DEFAULT_DEDUCTION_PRESET.amount;
  const amount = Number.isFinite(rawAmount) && rawAmount > 0 ? rawAmount : fallbackAmount;

  return { label, amount };
}

export function normalizeRatingInput(
  input: unknown,
  fallback: unknown = DEFAULT_RATING,
): NormalizedRating {
  const parsed = parseRatingInput(input);
  if (parsed) return parsed;

  if (input !== fallback) {
    const fallbackParsed = parseRatingInput(fallback);
    if (fallbackParsed) return fallbackParsed;
  }

  return {
    value: DEFAULT_RATING,
    label: formatRatingNumber(DEFAULT_RATING),
  };
}

export function formatRatingDisplay(bean: Pick<CoffeeBean, 'rating' | 'ratingLabel'>): string {
  return bean.ratingLabel.trim() || formatRatingNumber(bean.rating);
}

function parseRatingInput(input: unknown): NormalizedRating | null {
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) return null;
    const value = clampRating(input);
    return { value, label: formatRatingNumber(value) };
  }

  if (typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;
  const normalized = raw
    .replace(/[—–~～]/g, '-')
    .replace(/\s+/g, '');
  const parts = normalized.split('-').filter(Boolean);

  if (parts.length === 2) {
    const start = Number(parts[0]);
    const end = Number(parts[1]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    const min = clampRating(Math.min(start, end));
    const max = clampRating(Math.max(start, end));
    return {
      value: (min + max) / 2,
      label: `${formatRatingNumber(min)}-${formatRatingNumber(max)}`,
    };
  }

  if (parts.length === 1) {
    const value = Number(parts[0]);
    if (!Number.isFinite(value)) return null;
    const clamped = clampRating(value);
    return {
      value: clamped,
      label: formatRatingNumber(clamped),
    };
  }

  return null;
}

function clampRating(value: number): number {
  return Math.min(MAX_RATING, Math.max(MIN_RATING, value));
}

function formatRatingNumber(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '');
}

export function normalizeDisplayPrecision(
  precision: unknown,
  fallback: number = DEFAULT_DISPLAY_PRECISION,
): number {
  const fallbackValue = Math.trunc(Number(fallback));
  const fallbackPrecision = Number.isFinite(fallbackValue)
    ? Math.min(MAX_DISPLAY_PRECISION, Math.max(MIN_DISPLAY_PRECISION, fallbackValue))
    : DEFAULT_DISPLAY_PRECISION;
  const nextPrecision = Math.trunc(Number(precision));
  if (!Number.isFinite(nextPrecision)) return fallbackPrecision;
  return Math.min(MAX_DISPLAY_PRECISION, Math.max(MIN_DISPLAY_PRECISION, nextPrecision));
}

export function normalizeSettings(
  settings: Partial<CoffeeTrackerSettings> | null | undefined,
): CoffeeTrackerSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    displayPrecision: normalizeDisplayPrecision(settings?.displayPrecision),
  };
}

export function formatDisplayNumber(value: number, precision: number): string {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0';

  const normalizedPrecision = normalizeDisplayPrecision(precision);
  const rounded = Number(numericValue.toFixed(normalizedPrecision));
  if (rounded === 0) return '0';

  const fixed = rounded.toFixed(normalizedPrecision);
  if (normalizedPrecision === 0) return fixed;
  return fixed.replace(/\.?0+$/, '');
}

export function getPricePerGram(bean: CoffeeBean): number {
  if (bean.totalWeight <= 0) return 0;
  return bean.price / bean.totalWeight;
}
