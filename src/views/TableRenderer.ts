import { Notice } from 'obsidian';
import { CoffeeBean, getPricePerGram } from '../types';
import CoffeeBeanTrackerPlugin from '../main';

type SortField = 'name' | 'origin' | 'roaster' | 'price' | 'totalWeight' | 'remaining' | 'rating' | 'purchaseDate' | 'roastDate';

export class TableRenderer {
  private container: HTMLElement;
  private beans: CoffeeBean[];
  private plugin: CoffeeBeanTrackerPlugin;
  private onRefresh: () => void;
  private sortField: SortField | null = null;
  private sortAsc = true;

  constructor(container: HTMLElement, beans: CoffeeBean[], plugin: CoffeeBeanTrackerPlugin, onRefresh: () => void) {
    this.container = container;
    this.beans = beans;
    this.plugin = plugin;
    this.onRefresh = onRefresh;
  }

  render() {
    if (this.beans.length === 0) {
      this.container.createDiv({ cls: 'coffee-tracker-empty', text: '还没有咖啡豆，点击上方按钮添加' });
      return;
    }

    const sorted = this.getSortedBeans();
    const wrapper = this.container.createDiv({ cls: 'coffee-tracker-table-wrapper' });
    const table = wrapper.createEl('table', { cls: 'coffee-tracker-table' });

    this.renderHeader(table);
    this.renderBody(table, sorted);
  }

  private getSortedBeans(): CoffeeBean[] {
    if (!this.sortField) return [...this.beans];
    const field = this.sortField;
    const dir = this.sortAsc ? 1 : -1;
    return [...this.beans].sort((a, b) => {
      const va = a[field];
      const vb = b[field];
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }

  private renderHeader(table: HTMLElement) {
    const thead = table.createEl('thead');
    const tr = thead.createEl('tr');
    const columns: { label: string; field?: SortField }[] = [
      { label: '品名', field: 'name' },
      { label: '产地', field: 'origin' },
      { label: '烘焙商', field: 'roaster' },
      { label: '价格', field: 'price' },
      { label: '总克重', field: 'totalWeight' },
      { label: '余量', field: 'remaining' },
      { label: '克价' },
      { label: '评分', field: 'rating' },
      { label: '简评' },
      { label: '购入日期', field: 'purchaseDate' },
      { label: '烘焙日期', field: 'roastDate' },
      { label: '操作' },
    ];

    for (const col of columns) {
      const th = tr.createEl('th', { text: col.label });
      if (col.field) {
        th.addClass('coffee-tracker-sortable');
        if (this.sortField === col.field) {
          th.addClass(this.sortAsc ? 'sort-asc' : 'sort-desc');
        }
        th.addEventListener('click', () => {
          if (this.sortField === col.field) {
            this.sortAsc = !this.sortAsc;
          } else {
            this.sortField = col.field!;
            this.sortAsc = true;
          }
          this.container.empty();
          this.render();
        });
      }
    }
  }

  private renderBody(table: HTMLElement, beans: CoffeeBean[]) {
    const tbody = table.createEl('tbody');
    for (const bean of beans) {
      this.renderRow(tbody, bean);
    }
  }

  private renderRow(tbody: HTMLElement, bean: CoffeeBean) {
    const tr = tbody.createEl('tr');
    if (bean.archived) tr.addClass('coffee-tracker-row-archived');

    this.editableCell(tr, bean, 'name', 'text');
    this.editableCell(tr, bean, 'origin', 'text');
    this.editableCell(tr, bean, 'roaster', 'text');
    this.editableCell(tr, bean, 'price', 'number');
    this.editableCell(tr, bean, 'totalWeight', 'number');
    this.editableCell(tr, bean, 'remaining', 'number');

    const ppgCell = tr.createEl('td', { text: `¥${getPricePerGram(bean).toFixed(2)}` });
    ppgCell.addClass('coffee-tracker-cell-readonly');

    this.editableCell(tr, bean, 'rating', 'number');
    this.editableCell(tr, bean, 'comment', 'text');
    this.editableCell(tr, bean, 'purchaseDate', 'date');
    this.editableCell(tr, bean, 'roastDate', 'date');

    const actionCell = tr.createEl('td', { cls: 'coffee-tracker-cell-actions' });
    const presets = this.plugin.dataManager.data.settings.presets;
    for (const preset of presets) {
      const btn = actionCell.createEl('button', {
        cls: 'coffee-tracker-btn coffee-tracker-btn-deduct-sm',
        text: `-${preset.amount}g`,
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

    const historyBtn = actionCell.createEl('button', { cls: 'coffee-tracker-btn-link', text: '历史' });
    historyBtn.addEventListener('click', () => {
      const { HistoryModal } = require('../modals/HistoryModal');
      new HistoryModal(this.plugin.app, this.plugin, bean).open();
    });
  }

  private editableCell(tr: HTMLElement, bean: CoffeeBean, field: keyof CoffeeBean, inputType: string) {
    const value = bean[field];
    const td = tr.createEl('td', { text: String(value ?? '') });
    td.addClass('coffee-tracker-cell-editable');

    td.addEventListener('dblclick', () => {
      td.empty();
      const input = td.createEl('input', { type: inputType });
      input.value = String(value ?? '');
      input.addClass('coffee-tracker-cell-input');
      input.focus();
      input.select();

      const save = async () => {
        let newValue: string | number = input.value;
        if (inputType === 'number') {
          newValue = parseFloat(input.value) || 0;
        }
        if (newValue !== value) {
          await this.plugin.dataManager.updateBean(bean.id, { [field]: newValue } as any);
          this.onRefresh();
        } else {
          td.empty();
          td.textContent = String(value ?? '');
        }
      };

      input.addEventListener('blur', save);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') {
          td.empty();
          td.textContent = String(value ?? '');
        }
      });
    });
  }
}
