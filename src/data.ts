import {
  CoffeeBean,
  CoffeeTrackerData,
  ConsumptionRecord,
  DEFAULT_DATA,
  DEFAULT_DEDUCTION_PRESET,
  DeductionPreset,
  SETTLEMENT_PRESET_LABEL,
  generateId,
  normalizeDeductionPreset,
  normalizeRatingInput,
  normalizeSettings,
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
      const beans = (saved.beans || []).map((bean: Partial<CoffeeBean>) => {
        const rating = normalizeRatingInput(bean.ratingLabel || bean.rating);
        return {
          ...bean,
          image: bean.image || '',
          origin: bean.origin || '',
          process: bean.process || '',
          variety: bean.variety || '',
          roaster: bean.roaster || '',
          price: Number(bean.price) || 0,
          totalWeight: Number(bean.totalWeight) || 0,
          remaining: Number(bean.remaining) || 0,
          rating: rating.value,
          ratingLabel: rating.label,
          flavor: bean.flavor || '',
          comment: bean.comment || '',
          purchaseDate: bean.purchaseDate || '',
          roastDate: bean.roastDate || '',
          openedDate: bean.openedDate || '',
          deductionPreset: normalizeDeductionPreset(bean.deductionPreset, fallbackPreset),
          archived: Boolean(bean.archived),
        };
      }) as CoffeeBean[];

      this.data = {
        settings: normalizeSettings(saved.settings),
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

  async settleBean(beanId: string): Promise<boolean> {
    const bean = this.data.beans.find(b => b.id === beanId);
    if (!bean) return false;

    const amount = bean.remaining;
    bean.remaining = 0;
    bean.archived = true;

    if (amount > 0) {
      const record: ConsumptionRecord = {
        id: generateId(),
        beanId,
        amount,
        presetLabel: SETTLEMENT_PRESET_LABEL,
        timestamp: new Date().toISOString(),
      };
      this.data.history.push(record);
    }

    await this.save();
    return true;
  }

  getHistory(beanId: string): ConsumptionRecord[] {
    return this.data.history
      .filter(h => h.beanId === beanId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async deleteHistoryRecord(recordId: string): Promise<boolean> {
    const idx = this.data.history.findIndex(h => h.id === recordId);
    if (idx === -1) return false;

    const record = this.data.history[idx];
    const bean = this.data.beans.find(b => b.id === record.beanId);
    if (!bean) return false;

    const nextRemaining = bean.remaining + record.amount;
    if (nextRemaining > bean.totalWeight) return false;

    this.data.history.splice(idx, 1);
    bean.remaining = nextRemaining;
    if (bean.remaining > 0 && bean.archived) {
      bean.archived = false;
    }
    await this.save();
    return true;
  }

  async updateHistoryRecord(recordId: string, newAmount: number): Promise<boolean> {
    if (!Number.isFinite(newAmount) || newAmount <= 0) return false;

    const record = this.data.history.find(h => h.id === recordId);
    if (!record) return false;

    const bean = this.data.beans.find(b => b.id === record.beanId);
    if (!bean) return false;

    const diff = newAmount - record.amount;
    const nextRemaining = bean.remaining - diff;
    if (nextRemaining < 0 || nextRemaining > bean.totalWeight) return false;

    record.amount = newAmount;
    bean.remaining = nextRemaining;
    bean.archived = bean.remaining === 0;
    await this.save();
    return true;
  }

  getBeans(showArchived: boolean): CoffeeBean[] {
    if (showArchived) return this.data.beans;
    return this.data.beans.filter(b => !b.archived);
  }
}
