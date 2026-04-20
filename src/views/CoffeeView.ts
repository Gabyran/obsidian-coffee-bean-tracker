import { ItemView, WorkspaceLeaf } from 'obsidian';
import CoffeeBeanTrackerPlugin from '../main';
import { KanbanRenderer } from './KanbanRenderer';
import { TableRenderer } from './TableRenderer';

export const VIEW_TYPE_COFFEE = 'coffee-bean-tracker';

export class CoffeeView extends ItemView {
  plugin: CoffeeBeanTrackerPlugin;
  private currentView: 'kanban' | 'table';
  private contentEl_: HTMLElement;
  private showArchived: boolean;

  constructor(leaf: WorkspaceLeaf, plugin: CoffeeBeanTrackerPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.currentView = plugin.dataManager.data.settings.defaultView;
    this.showArchived = plugin.dataManager.data.settings.showArchived;
    this.contentEl_ = createDiv();
  }

  getViewType(): string {
    return VIEW_TYPE_COFFEE;
  }

  getDisplayText(): string {
    return '咖啡豆库存';
  }

  getIcon(): string {
    return 'coffee';
  }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass('coffee-tracker-container');

    const toolbar = container.createDiv({ cls: 'coffee-tracker-toolbar' });
    this.buildToolbar(toolbar);

    this.contentEl_ = container.createDiv({ cls: 'coffee-tracker-content' });
    this.refresh();
  }

  private buildToolbar(toolbar: HTMLElement) {
    const leftGroup = toolbar.createDiv({ cls: 'coffee-tracker-toolbar-left' });
    const rightGroup = toolbar.createDiv({ cls: 'coffee-tracker-toolbar-right' });

    const viewToggle = leftGroup.createEl('button', {
      cls: 'coffee-tracker-btn',
      text: this.currentView === 'kanban' ? '切换表格' : '切换看板',
    });
    viewToggle.addEventListener('click', () => {
      this.currentView = this.currentView === 'kanban' ? 'table' : 'kanban';
      viewToggle.textContent = this.currentView === 'kanban' ? '切换表格' : '切换看板';
      this.plugin.dataManager.data.settings.defaultView = this.currentView;
      this.plugin.dataManager.save();
      this.refresh();
    });

    const archiveToggle = leftGroup.createEl('label', { cls: 'coffee-tracker-checkbox-label' });
    const checkbox = archiveToggle.createEl('input', { type: 'checkbox' });
    checkbox.checked = this.showArchived;
    checkbox.addEventListener('change', () => {
      this.showArchived = checkbox.checked;
      this.plugin.dataManager.data.settings.showArchived = this.showArchived;
      this.plugin.dataManager.save();
      this.refresh();
    });
    archiveToggle.appendText('显示已用完');

    const addBtn = rightGroup.createEl('button', {
      cls: 'coffee-tracker-btn coffee-tracker-btn-primary',
      text: '+ 添加咖啡豆',
    });
    addBtn.addEventListener('click', () => {
      const { AddBeanModal } = require('../modals/AddBeanModal');
      new AddBeanModal(this.app, this.plugin, () => this.refresh()).open();
    });
  }

  refresh() {
    this.contentEl_.empty();
    const beans = this.plugin.dataManager.getBeans(this.showArchived);

    if (this.currentView === 'kanban') {
      new KanbanRenderer(this.contentEl_, beans, this.plugin, () => this.refresh()).render();
    } else {
      new TableRenderer(this.contentEl_, beans, this.plugin, () => this.refresh()).render();
    }
  }

  async onClose() {}
}
