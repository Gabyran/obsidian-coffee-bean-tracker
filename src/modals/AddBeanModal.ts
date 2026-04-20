import { App, Modal, Setting } from 'obsidian';
import CoffeeBeanTrackerPlugin from '../main';
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
      name: '', image: '', origin: '', roaster: '',
      price: '', totalWeight: '', rating: '7',
      comment: '', purchaseDate: '', roastDate: '',
    };

    const fields: { key: string; label: string; type?: string; placeholder?: string }[] = [
      { key: 'name', label: '品名', placeholder: 'Ethiopia Yirgacheffe' },
      { key: 'origin', label: '产地', placeholder: 'Ethiopia' },
      { key: 'roaster', label: '烘焙商', placeholder: 'SEE' },
      { key: 'price', label: '价格 (¥)', type: 'number', placeholder: '128' },
      { key: 'totalWeight', label: '总克重 (g)', type: 'number', placeholder: '250' },
      { key: 'rating', label: '评分 (1-10)', type: 'number', placeholder: '7' },
      { key: 'comment', label: '简评', placeholder: '花香明显，酸甜平衡' },
      { key: 'purchaseDate', label: '购入日期', type: 'date' },
      { key: 'roastDate', label: '烘焙日期', type: 'date' },
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
            await this.plugin.dataManager.addBean({
              name: form.name,
              image: form.image,
              origin: form.origin,
              roaster: form.roaster,
              price: parseFloat(form.price) || 0,
              totalWeight,
              remaining: totalWeight,
              rating: Math.min(10, Math.max(1, parseInt(form.rating) || 7)),
              comment: form.comment,
              purchaseDate: form.purchaseDate,
              roastDate: form.roastDate,
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
