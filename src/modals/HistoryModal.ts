import { App, Modal } from 'obsidian';
import CoffeeBeanTrackerPlugin from '../main';
import { CoffeeBean } from '../types';

export class HistoryModal extends Modal {
  private plugin: CoffeeBeanTrackerPlugin;
  private bean: CoffeeBean;

  constructor(app: App, plugin: CoffeeBeanTrackerPlugin, bean: CoffeeBean) {
    super(app);
    this.plugin = plugin;
    this.bean = bean;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('coffee-tracker-modal');
    contentEl.createEl('h3', { text: `${this.bean.name} — 消费记录` });

    const records = this.plugin.dataManager.getHistory(this.bean.id);

    if (records.length === 0) {
      contentEl.createDiv({ text: '暂无消费记录', cls: 'coffee-tracker-empty' });
      return;
    }

    const table = contentEl.createEl('table', { cls: 'coffee-tracker-table coffee-tracker-history-table' });
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');
    headerRow.createEl('th', { text: '时间' });
    headerRow.createEl('th', { text: '用量' });
    headerRow.createEl('th', { text: '方式' });

    const tbody = table.createEl('tbody');
    let totalConsumed = 0;
    for (const record of records) {
      const tr = tbody.createEl('tr');
      const date = new Date(record.timestamp);
      tr.createEl('td', { text: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` });
      tr.createEl('td', { text: `${record.amount}g` });
      tr.createEl('td', { text: record.presetLabel });
      totalConsumed += record.amount;
    }

    contentEl.createDiv({
      cls: 'coffee-tracker-history-summary',
      text: `共消费 ${records.length} 次，合计 ${totalConsumed}g`,
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
