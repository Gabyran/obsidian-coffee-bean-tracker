export interface CoffeeBean {
  id: string;
  name: string;
  image: string;
  origin: string;
  roaster: string;
  price: number;
  totalWeight: number;
  remaining: number;
  rating: number;
  comment: string;
  purchaseDate: string;
  roastDate: string;
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

export interface CoffeeTrackerSettings {
  presets: DeductionPreset[];
  defaultView: 'kanban' | 'table';
  showArchived: boolean;
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

export const DEFAULT_SETTINGS: CoffeeTrackerSettings = {
  presets: [
    DEFAULT_DEDUCTION_PRESET,
    { label: '双杯', amount: 30 },
  ],
  defaultView: 'kanban',
  showArchived: false,
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

export function getPricePerGram(bean: CoffeeBean): number {
  if (bean.totalWeight <= 0) return 0;
  return bean.price / bean.totalWeight;
}
