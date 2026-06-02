import { Plugin } from 'obsidian';
import { DataManager } from './data';
import { CoffeeView, VIEW_TYPE_COFFEE } from './views/CoffeeView';
import { CoffeeTrackerSettingTab } from './settings';

export default class CoffeeBeanTrackerPlugin extends Plugin {
  dataManager!: DataManager;

  async onload() {
    this.dataManager = new DataManager(this);
    await this.dataManager.load();

    this.registerView(VIEW_TYPE_COFFEE, (leaf) => new CoffeeView(leaf, this));

    this.addRibbonIcon('cup-soda', '咖啡豆库存', () => {
      this.activateView();
    });

    this.addCommand({
      id: 'open-coffee-tracker',
      name: '打开咖啡豆库存',
      callback: () => this.activateView(),
    });

    this.addSettingTab(new CoffeeTrackerSettingTab(this.app, this));
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_COFFEE)[0];
    if (!leaf) {
      const newLeaf = workspace.getLeaf(true);
      await newLeaf.setViewState({ type: VIEW_TYPE_COFFEE, active: true });
      leaf = newLeaf;
    }
    workspace.revealLeaf(leaf);
  }

  refreshViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_COFFEE)) {
      if (leaf.view instanceof CoffeeView) {
        leaf.view.refresh();
      }
    }
  }

  onunload() {}
}
