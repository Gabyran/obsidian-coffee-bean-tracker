import { App, Modal, Notice } from 'obsidian';
import CoffeeBeanTrackerPlugin from '../main';
import { CoffeeBean, formatDisplayNumber } from '../types';

export class HistoryModal extends Modal {
  private plugin: CoffeeBeanTrackerPlugin;
  private bean: CoffeeBean;
  private onSave: () => void;

  constructor(app: App, plugin: CoffeeBeanTrackerPlugin, bean: CoffeeBean, onSave: () => void) {
    super(app);
    this.plugin = plugin;
    this.bean = bean;
    this.onSave = onSave;
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
    headerRow.createEl('th', { text: '操作' });

    const tbody = table.createEl('tbody');
    let totalConsumed = 0;
    for (const record of records) {
      const tr = tbody.createEl('tr');
      const date = new Date(record.timestamp);
      tr.createEl('td', { text: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` });

      const amountTd = tr.createEl('td');
      const amountSpan = amountTd.createSpan({ text: `${this.formatNumber(record.amount)}g` });

      tr.createEl('td', { text: record.presetLabel });

      const actionsTd = tr.createEl('td');
      actionsTd.addClass('coffee-tracker-history-actions');

      const editBtn = actionsTd.createEl('button', { text: '编辑', cls: 'coffee-tracker-history-btn-edit' });
      editBtn.addEventListener('click', () => {
        if (amountTd.querySelector('input')) return;

        amountSpan.style.display = 'none';
        const input = amountTd.createEl('input', {
          cls: 'coffee-tracker-history-input',
          attr: { type: 'number', step: '0.1', value: String(record.amount) },
        });
        input.focus();
        input.select();

        const save = async () => {
          const val = parseFloat(input.value);
          if (!Number.isFinite(val) || val <= 0) {
            new Notice('克数必须大于 0');
            cancel();
            return;
          }
          if (val === record.amount) {
            cancel();
            return;
          }
          const success = await this.plugin.dataManager.updateHistoryRecord(record.id, val);
          if (success) {
            this.onSave();
            this.refresh();
          } else {
            new Notice('余量超出范围，无法调整');
            cancel();
          }
        };

        const cancel = () => {
          input.remove();
          amountSpan.style.display = '';
        };

        input.addEventListener('blur', () => void save());
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            void save();
          }
          if (e.key === 'Escape') {
            cancel();
          }
        });
      });

      const deleteBtn = actionsTd.createEl('button', { text: '删除', cls: 'coffee-tracker-history-btn-delete' });
      deleteBtn.addEventListener('click', async () => {
        if (!window.confirm('确认删除这条消费记录？')) return;
        const success = await this.plugin.dataManager.deleteHistoryRecord(record.id);
        if (success) {
          this.onSave();
          this.refresh();
        }
      });

      totalConsumed += record.amount;
    }

    contentEl.createDiv({
      cls: 'coffee-tracker-history-summary',
      text: `共消费 ${records.length} 次，合计 ${this.formatNumber(totalConsumed)}g`,
    });
  }

  private refresh() {
    this.contentEl.empty();
    this.onOpen();
  }

  onClose() {
    this.contentEl.empty();
  }

  private formatNumber(value: number): string {
    return formatDisplayNumber(value, this.plugin.dataManager.data.settings.displayPrecision);
  }
}
