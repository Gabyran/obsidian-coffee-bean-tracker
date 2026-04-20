import { App, PluginSettingTab, Setting } from 'obsidian';
import CoffeeBeanTrackerPlugin from './main';

export class CoffeeTrackerSettingTab extends PluginSettingTab {
  plugin: CoffeeBeanTrackerPlugin;

  constructor(app: App, plugin: CoffeeBeanTrackerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: '咖啡豆库存设置' });

    new Setting(containerEl)
      .setName('扣减预设')
      .setDesc('现在每个豆子单独保存一个扣减预设。可直接在看板卡片里修改，也可在新增/编辑弹窗里设置。');

    containerEl.createEl('h3', { text: '默认视图' });
    new Setting(containerEl)
      .setName('打开时的默认视图')
      .addDropdown(drop => {
        drop.addOption('kanban', '看板');
        drop.addOption('table', '表格');
        drop.setValue(this.plugin.dataManager.data.settings.defaultView);
        drop.onChange(v => {
          this.plugin.dataManager.data.settings.defaultView = v as 'kanban' | 'table';
          this.plugin.dataManager.save();
        });
      });
  }
}
