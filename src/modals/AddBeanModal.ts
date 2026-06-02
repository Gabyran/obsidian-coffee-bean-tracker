import { App, Modal, Setting } from 'obsidian';
import CoffeeBeanTrackerPlugin from '../main';
import { DEFAULT_DEDUCTION_PRESET, normalizeDeductionPreset, normalizeRatingInput } from '../types';
import { renderBeanImageField } from '../utils/beanImage';

export class AddBeanModal extends Modal {
  private plugin: CoffeeBeanTrackerPlugin;
  private onSave: () => void;

  constructor(app: App, plugin: CoffeeBeanTrackerPlugin, onSave: () => void) {
    super(app);
    this.plugin = plugin;
    this.onSave = onSave;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('coffee-tracker-modal');
    contentEl.createEl('h3', { text: '添加咖啡豆' });

    const form: Record<string, string> = {
      name: '', image: '', origin: '', process: '', variety: '', roaster: '',
      price: '', totalWeight: '', rating: '7',
      flavor: '', comment: '', purchaseDate: '', roastDate: '', openedDate: '',
      deductionLabel: DEFAULT_DEDUCTION_PRESET.label,
      deductionAmount: String(DEFAULT_DEDUCTION_PRESET.amount),
    };

    const fields: { key: string; label: string; type?: string; placeholder?: string }[] = [
      { key: 'name', label: '种植庄园 / 豆名', placeholder: 'El Miraflor' },
      { key: 'origin', label: '产地', placeholder: 'Ethiopia' },
      { key: 'process', label: '处理法', placeholder: '水洗 / 日晒 / 蜜处理' },
      { key: 'variety', label: '豆种', placeholder: 'Geisha / SL28 / Bourbon' },
      { key: 'roaster', label: '烘焙商', placeholder: 'SEE' },
      { key: 'price', label: '价格 (¥)', type: 'number', placeholder: '128' },
      { key: 'totalWeight', label: '总克重 (g)', type: 'number', placeholder: '250' },
      { key: 'rating', label: '评分 (10 分制)', placeholder: '8.25 或 8.25-8.5' },
      { key: 'flavor', label: '风味', placeholder: '花香，柑橘，茶感' },
      { key: 'comment', label: '备注', placeholder: '萃取建议、饮用感受' },
      { key: 'purchaseDate', label: '购入日期', type: 'date' },
      { key: 'roastDate', label: '烘焙日期', type: 'date' },
      { key: 'openedDate', label: '开袋日期', type: 'date' },
      { key: 'deductionLabel', label: '扣减预设名称', placeholder: '单杯' },
      { key: 'deductionAmount', label: '扣减预设克数 (g)', type: 'number', placeholder: '15' },
    ];

    for (const f of fields) {
      new Setting(contentEl)
        .setName(f.label)
        .addText(text => {
          if (f.type === 'number') text.inputEl.type = 'number';
          if (f.type === 'date') text.inputEl.type = 'date';
          if (f.placeholder) text.setPlaceholder(f.placeholder);
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

    new Setting(contentEl)
      .addButton(btn => {
        btn.setButtonText('保存')
          .setCta()
          .onClick(async () => {
            if (!form.name) return;
            const totalWeight = parseFloat(form.totalWeight) || 0;
            const deductionPreset = normalizeDeductionPreset({
              label: form.deductionLabel,
              amount: parseFloat(form.deductionAmount),
            });
            const rating = normalizeRatingInput(form.rating);
            await this.plugin.dataManager.addBean({
              name: form.name,
              image: form.image,
              origin: form.origin,
              process: form.process,
              variety: form.variety,
              roaster: form.roaster,
              price: parseFloat(form.price) || 0,
              totalWeight,
              remaining: totalWeight,
              rating: rating.value,
              ratingLabel: rating.label,
              flavor: form.flavor,
              comment: form.comment,
              purchaseDate: form.purchaseDate,
              roastDate: form.roastDate,
              openedDate: form.openedDate,
              deductionPreset,
            });
            this.close();
            this.onSave();
          });
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}
