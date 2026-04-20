import { Notice } from 'obsidian';
import { CoffeeBean, DeductionPreset, getPricePerGram, normalizeDeductionPreset } from '../types';
import CoffeeBeanTrackerPlugin from '../main';

export class KanbanRenderer {
  private container: HTMLElement;
  private beans: CoffeeBean[];
  private plugin: CoffeeBeanTrackerPlugin;
  private onRefresh: () => void;

  constructor(container: HTMLElement, beans: CoffeeBean[], plugin: CoffeeBeanTrackerPlugin, onRefresh: () => void) {
    this.container = container;
    this.beans = beans;
    this.plugin = plugin;
    this.onRefresh = onRefresh;
  }

  render() {
    const grid = this.container.createDiv({ cls: 'coffee-tracker-grid' });

    if (this.beans.length === 0) {
      grid.createDiv({ cls: 'coffee-tracker-empty', text: '还没有咖啡豆，点击上方按钮添加' });
      return;
    }

    for (const bean of this.beans) {
      this.renderCard(grid, bean);
    }
  }

  private renderCard(grid: HTMLElement, bean: CoffeeBean) {
    const card = grid.createDiv({ cls: 'coffee-tracker-card' });
    if (bean.archived) card.addClass('coffee-tracker-card-archived');

    if (bean.image) {
      const imgContainer = card.createDiv({ cls: 'coffee-tracker-card-img' });
      const img = imgContainer.createEl('img');
      if (bean.image.startsWith('http')) {
        img.src = bean.image;
      } else {
        const resourcePath = this.plugin.app.vault.adapter.getResourcePath(bean.image);
        img.src = resourcePath;
      }
      img.alt = bean.name;
      img.onerror = () => {
        imgContainer.empty();
        imgContainer.createDiv({ cls: 'coffee-tracker-card-img-placeholder', text: '☕' });
      };
    }

    const info = card.createDiv({ cls: 'coffee-tracker-card-info' });
    info.createDiv({ cls: 'coffee-tracker-card-name', text: bean.name });

    const details = info.createDiv({ cls: 'coffee-tracker-card-details' });
    if (bean.origin) details.createDiv({ text: `产地: ${bean.origin}` });
    if (bean.roaster) details.createDiv({ text: `烘焙商: ${bean.roaster}` });

    const progressContainer = info.createDiv({ cls: 'coffee-tracker-progress-container' });
    const ratio = bean.totalWeight > 0 ? bean.remaining / bean.totalWeight : 0;
    const progressBar = progressContainer.createDiv({ cls: 'coffee-tracker-progress-bar' });
    const progressFill = progressBar.createDiv({ cls: 'coffee-tracker-progress-fill' });
    progressFill.style.width = `${ratio * 100}%`;
    if (ratio < 0.2) progressFill.addClass('coffee-tracker-progress-low');
    progressContainer.createDiv({
      cls: 'coffee-tracker-progress-text',
      text: `${bean.remaining}g / ${bean.totalWeight}g`,
    });

    const meta = info.createDiv({ cls: 'coffee-tracker-card-meta' });
    const ppg = getPricePerGram(bean);
    meta.createSpan({ text: `¥${ppg.toFixed(2)}/g` });
    meta.createSpan({ text: `评分: ${bean.rating}/10` });

    const actions = card.createDiv({ cls: 'coffee-tracker-card-actions' });
    this.renderPresetEditor(actions, bean);

    const bottomActions = card.createDiv({ cls: 'coffee-tracker-card-bottom' });
    const editBtn = bottomActions.createEl('button', { cls: 'coffee-tracker-btn-link', text: '编辑' });
    editBtn.addEventListener('click', () => {
      const { EditBeanModal } = require('../modals/EditBeanModal');
      new EditBeanModal(this.plugin.app, this.plugin, bean, () => this.onRefresh()).open();
    });

    const historyBtn = bottomActions.createEl('button', { cls: 'coffee-tracker-btn-link', text: '历史' });
    historyBtn.addEventListener('click', () => {
      const { HistoryModal } = require('../modals/HistoryModal');
      new HistoryModal(this.plugin.app, this.plugin, bean).open();
    });
  }

  private renderPresetEditor(container: HTMLElement, bean: CoffeeBean) {
    const wrapper = container.createDiv({ cls: 'coffee-tracker-preset-editor' });
    wrapper.createDiv({ cls: 'coffee-tracker-preset-label', text: '库存减少预设' });

    const fields = wrapper.createDiv({ cls: 'coffee-tracker-preset-fields' });
    const labelInput = fields.createEl('input', {
      cls: 'coffee-tracker-preset-input',
      type: 'text',
      placeholder: '名称',
    });
    labelInput.value = bean.deductionPreset.label;

    const amountGroup = fields.createDiv({ cls: 'coffee-tracker-preset-amount-group' });
    const amountInput = amountGroup.createEl('input', {
      cls: 'coffee-tracker-preset-input coffee-tracker-preset-input-amount',
      type: 'number',
      placeholder: '克数',
    });
    amountInput.value = String(bean.deductionPreset.amount);
    amountInput.min = '1';
    amountInput.step = '1';
    amountGroup.createSpan({ cls: 'coffee-tracker-preset-unit', text: 'g' });

    const hint = wrapper.createDiv({
      cls: 'coffee-tracker-preset-hint',
      text: '直接修改名称或克数，会自动保存',
    });

    const actionBtn = wrapper.createEl('button', {
      cls: 'coffee-tracker-btn coffee-tracker-btn-deduct',
    });

    let lastSavedPreset = normalizeDeductionPreset(bean.deductionPreset);
    let saveTimer: number | null = null;
    let isSaving = false;

    const getDraftPreset = (): DeductionPreset => normalizeDeductionPreset({
      label: labelInput.value,
      amount: parseFloat(amountInput.value),
    }, lastSavedPreset);

    const renderActionLabel = () => {
      const draft = getDraftPreset();
      actionBtn.textContent = `${draft.label} -${draft.amount}g`;
    };

    const persistPreset = async (force = false): Promise<DeductionPreset> => {
      if (saveTimer !== null) {
        window.clearTimeout(saveTimer);
        saveTimer = null;
      }

      const nextPreset = getDraftPreset();
      labelInput.value = nextPreset.label;
      amountInput.value = String(nextPreset.amount);
      renderActionLabel();

      const changed = nextPreset.label !== lastSavedPreset.label || nextPreset.amount !== lastSavedPreset.amount;
      if (!changed) return lastSavedPreset;
      if (isSaving) return lastSavedPreset;

      isSaving = true;
      hint.textContent = '保存中...';
      try {
        await this.plugin.dataManager.updateBean(bean.id, { deductionPreset: nextPreset });
        bean.deductionPreset = nextPreset;
        lastSavedPreset = nextPreset;
        hint.textContent = '已自动保存';
      } catch (error) {
        hint.textContent = '保存失败，请重试';
        new Notice(error instanceof Error ? error.message : '保存预设失败');
      } finally {
        isSaving = false;
      }
      return lastSavedPreset;
    };

    const scheduleSave = () => {
      renderActionLabel();
      hint.textContent = '正在修改...';
      if (saveTimer !== null) {
        window.clearTimeout(saveTimer);
      }
      saveTimer = window.setTimeout(() => {
        void persistPreset();
      }, 300);
    };

    labelInput.addEventListener('input', scheduleSave);
    amountInput.addEventListener('input', scheduleSave);
    labelInput.addEventListener('blur', () => { void persistPreset(true); });
    amountInput.addEventListener('blur', () => { void persistPreset(true); });

    renderActionLabel();
    actionBtn.addEventListener('click', async () => {
      const preset = await persistPreset(true);
      const success = await this.plugin.dataManager.deduct(bean.id, preset);
      if (success) {
        new Notice(`${bean.name}: -${preset.amount}g`);
        this.onRefresh();
      } else {
        new Notice('余量不足！');
      }
    });
  }
}
