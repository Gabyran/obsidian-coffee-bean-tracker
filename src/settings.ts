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

    containerEl.createEl('h3', { text: '扣减预设' });
    const presets = this.plugin.dataManager.data.settings.presets;

    for (let i = 0; i < presets.length; i++) {
      const preset = presets[i];
      new Setting(containerEl)
        .setName(`预设 ${i + 1}`)
        .addText(text => {
          text.setPlaceholder('名称').setValue(preset.label);
          text.onChange(v => { preset.label = v; this.plugin.dataManager.save(); });
        })
        .addText(text => {
          text.inputEl.type = 'number';
          text.setPlaceholder('克数').setValue(String(preset.amount));
          text.onChange(v => { preset.amount = parseInt(v) || 0; this.plugin.dataManager.save(); });
        })
        .addButton(btn => {
          btn.setIcon('trash').setWarning().onClick(() => {
            presets.splice(i, 1);
            this.plugin.dataManager.save();
            this.display();
          });
        });
    }

    new Setting(containerEl)
      .addButton(btn => {
        btn.setButtonText('+ 添加预设').onClick(() => {
          presets.push({ label: '新预设', amount: 15 });
          this.plugin.dataManager.save();
          this.display();
        });
      });

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
