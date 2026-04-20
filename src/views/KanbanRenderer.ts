import { Notice } from 'obsidian';
import { CoffeeBean, getPricePerGram } from '../types';
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
    const presets = this.plugin.dataManager.data.settings.presets;
    for (const preset of presets) {
      const btn = actions.createEl('button', {
        cls: 'coffee-tracker-btn coffee-tracker-btn-deduct',
        text: `${preset.label} -${preset.amount}g`,
      });
      btn.addEventListener('click', async () => {
        const success = await this.plugin.dataManager.deduct(bean.id, preset);
        if (success) {
          new Notice(`${bean.name}: -${preset.amount}g`);
          this.onRefresh();
        } else {
          new Notice('余量不足！');
        }
      });
    }

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
}
