import {
  CoffeeBean,
  CoffeeTrackerData,
  ConsumptionRecord,
  DEFAULT_DATA,
  DEFAULT_DEDUCTION_PRESET,
  DEFAULT_SETTINGS,
  DeductionPreset,
  generateId,
  normalizeDeductionPreset,
} from './types';
import CoffeeBeanTrackerPlugin from './main';

export class DataManager {
  private plugin: CoffeeBeanTrackerPlugin;
  data: CoffeeTrackerData;

  constructor(plugin: CoffeeBeanTrackerPlugin) {
    this.plugin = plugin;
    this.data = DEFAULT_DATA;
  }

  async load() {
    const saved = await this.plugin.loadData();
    if (saved) {
      const fallbackPreset = normalizeDeductionPreset(saved.settings?.presets?.[0], DEFAULT_DEDUCTION_PRESET);
      const beans = (saved.beans || []).map((bean: Partial<CoffeeBean>) => ({
        ...bean,
        deductionPreset: normalizeDeductionPreset(bean.deductionPreset, fallbackPreset),
      })) as CoffeeBean[];

      this.data = {
        settings: { ...DEFAULT_SETTINGS, ...saved.settings },
        beans,
        history: saved.history || [],
      };
    }
  }

  async save() {
    await this.plugin.saveData(this.data);
  }

  async addBean(bean: Omit<CoffeeBean, 'id' | 'archived'>): Promise<CoffeeBean> {
    const newBean: CoffeeBean = {
      ...bean,
      id: generateId(),
      archived: false,
    };
    this.data.beans.push(newBean);
    await this.save();
    return newBean;
  }

  async updateBean(id: string, updates: Partial<CoffeeBean>) {
    const idx = this.data.beans.findIndex(b => b.id === id);
    if (idx === -1) return;
    const nextBean = {
      ...this.data.beans[idx],
      ...updates,
    };
    nextBean.deductionPreset = normalizeDeductionPreset(
      nextBean.deductionPreset,
      this.data.beans[idx].deductionPreset || DEFAULT_DEDUCTION_PRESET,
    );
    this.data.beans[idx] = nextBean;
    await this.save();
  }

  async deleteBean(id: string) {
    this.data.beans = this.data.beans.filter(b => b.id !== id);
    this.data.history = this.data.history.filter(h => h.beanId !== id);
    await this.save();
  }

  async deduct(beanId: string, preset: DeductionPreset): Promise<boolean> {
    const bean = this.data.beans.find(b => b.id === beanId);
    if (!bean || bean.remaining < preset.amount) return false;

    bean.remaining -= preset.amount;
    if (bean.remaining <= 0) {
      bean.remaining = 0;
      bean.archived = true;
    }

    const record: ConsumptionRecord = {
      id: generateId(),
      beanId,
      amount: preset.amount,
      presetLabel: preset.label,
      timestamp: new Date().toISOString(),
    };
    this.data.history.push(record);
    await this.save();
    return true;
  }

  getHistory(beanId: string): ConsumptionRecord[] {
    return this.data.history
      .filter(h => h.beanId === beanId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  getBeans(showArchived: boolean): CoffeeBean[] {
    if (showArchived) return this.data.beans;
    return this.data.beans.filter(b => !b.archived);
  }
}
