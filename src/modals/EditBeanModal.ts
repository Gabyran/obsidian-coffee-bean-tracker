import { App, Modal, Setting } from 'obsidian';
import CoffeeBeanTrackerPlugin from '../main';
import { CoffeeBean, normalizeDeductionPreset } from '../types';
import { renderBeanImageField } from '../utils/beanImage';

export class EditBeanModal extends Modal {
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
    contentEl.createEl('h3', { text: '编辑咖啡豆' });

    const form: Record<string, string> = {
      name: this.bean.name,
      image: this.bean.image,
      origin: this.bean.origin,
      roaster: this.bean.roaster,
      price: String(this.bean.price),
      totalWeight: String(this.bean.totalWeight),
      remaining: String(this.bean.remaining),
      rating: String(this.bean.rating),
      comment: this.bean.comment,
      purchaseDate: this.bean.purchaseDate,
      roastDate: this.bean.roastDate,
      deductionLabel: this.bean.deductionPreset.label,
      deductionAmount: String(this.bean.deductionPreset.amount),
    };

    const fields: { key: string; label: string; type?: string }[] = [
      { key: 'name', label: '品名' },
      { key: 'origin', label: '产地' },
      { key: 'roaster', label: '烘焙商' },
      { key: 'price', label: '价格 (¥)', type: 'number' },
      { key: 'totalWeight', label: '总克重 (g)', type: 'number' },
      { key: 'remaining', label: '余量 (g)', type: 'number' },
      { key: 'rating', label: '评分 (1-10)', type: 'number' },
      { key: 'comment', label: '简评' },
      { key: 'purchaseDate', label: '购入日期', type: 'date' },
      { key: 'roastDate', label: '烘焙日期', type: 'date' },
      { key: 'deductionLabel', label: '扣减预设名称' },
      { key: 'deductionAmount', label: '扣减预设克数 (g)', type: 'number' },
    ];

    for (const f of fields) {
      new Setting(contentEl)
        .setName(f.label)
        .addText(text => {
          if (f.type === 'number') text.inputEl.type = 'number';
          if (f.type === 'date') text.inputEl.type = 'date';
          text.setValue(form[f.key]);
          text.onChange(v => { form[f.key] = v; });
        });

      if (f.key === 'name') {
        renderBeanImageField({
          containerEl: contentEl,
          app: this.app,
          value: form.image,
          onChange: (value) => {
            form.image = value;
          },
          getSuggestedName: () => form.name,
        });
      }
    }

    const btnRow = new Setting(contentEl);
    btnRow.addButton(btn => {
      btn.setButtonText('保存').setCta().onClick(async () => {
        const deductionPreset = normalizeDeductionPreset({
          label: form.deductionLabel,
          amount: parseFloat(form.deductionAmount),
        }, this.bean.deductionPreset);
        await this.plugin.dataManager.updateBean(this.bean.id, {
          name: form.name,
          image: form.image,
          origin: form.origin,
          roaster: form.roaster,
          price: parseFloat(form.price) || 0,
          totalWeight: parseFloat(form.totalWeight) || 0,
          remaining: parseFloat(form.remaining) || 0,
          rating: Math.min(10, Math.max(1, parseInt(form.rating) || 7)),
          comment: form.comment,
          purchaseDate: form.purchaseDate,
          roastDate: form.roastDate,
          deductionPreset,
        });
        this.close();
        this.onSave();
      });
    });
    btnRow.addButton(btn => {
      btn.setButtonText('删除').setWarning().onClick(async () => {
        await this.plugin.dataManager.deleteBean(this.bean.id);
        this.close();
        this.onSave();
      });
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
