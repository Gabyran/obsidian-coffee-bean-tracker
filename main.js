var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/beanImage.ts
function sanitizeFileNamePart(value) {
  const cleaned = value.trim().replace(/[\\/:*?"<>|#^\[\]]+/g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return cleaned || "coffee-bean";
}
function getImageExtension(mimeType) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "png";
  }
}
async function ensureFolder(app, folderPath) {
  const normalizedFolder = (0, import_obsidian.normalizePath)(folderPath);
  const parts = normalizedFolder.split("/");
  let currentPath = "";
  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    const existing = app.vault.getAbstractFileByPath(currentPath);
    if (!existing) {
      await app.vault.createFolder(currentPath);
    }
  }
}
async function saveImageBlobToVault(app, blob, preferredName) {
  await ensureFolder(app, IMAGE_FOLDER);
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  const randomSuffix = Math.random().toString(36).slice(2, 7);
  const safeName = sanitizeFileNamePart(preferredName || "");
  const extension = getImageExtension(blob.type);
  const filePath = (0, import_obsidian.normalizePath)(
    `${IMAGE_FOLDER}/${safeName}-${timestamp}-${randomSuffix}.${extension}`
  );
  const buffer = await blob.arrayBuffer();
  await app.vault.createBinary(filePath, buffer);
  return filePath;
}
function resolveImageSrc(app, imagePath) {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }
  return app.vault.adapter.getResourcePath((0, import_obsidian.normalizePath)(imagePath));
}
async function extractImageFromClipboard(evt) {
  var _a;
  const items = Array.from(((_a = evt.clipboardData) == null ? void 0 : _a.items) || []);
  const imageItem = items.find((item) => item.type.startsWith("image/"));
  return (imageItem == null ? void 0 : imageItem.getAsFile()) || null;
}
function renderBeanImageField(options) {
  const { containerEl, app, onChange, getSuggestedName } = options;
  let currentValue = options.value || "";
  let pathInput = null;
  const imageSetting = new import_obsidian.Setting(containerEl).setName("\u56FE\u7247").setDesc("\u652F\u6301\u624B\u586B\u8DEF\u5F84\uFF0C\u4E5F\u652F\u6301\u5728\u4E0B\u65B9\u533A\u57DF\u70B9\u51FB\u540E\u76F4\u63A5\u7C98\u8D34\u526A\u8D34\u677F\u56FE\u7247");
  imageSetting.addText((text) => {
    pathInput = text;
    text.setPlaceholder("vault \u8DEF\u5F84\u6216 URL");
    text.setValue(currentValue);
    text.onChange((value) => {
      currentValue = value.trim();
      onChange(currentValue);
      renderPreview();
      updateButtons();
    });
    text.inputEl.addEventListener("paste", async (evt) => {
      const imageFile = await extractImageFromClipboard(evt);
      if (!imageFile) return;
      evt.preventDefault();
      await saveClipboardImage(imageFile);
    });
  });
  const imageField = containerEl.createDiv({ cls: "coffee-tracker-image-field" });
  const preview = imageField.createDiv({ cls: "coffee-tracker-image-preview" });
  const pasteZone = imageField.createDiv({
    cls: "coffee-tracker-image-paste-zone",
    text: "\u70B9\u51FB\u8FD9\u91CC\u540E\u6309 Cmd/Ctrl + V \u7C98\u8D34\u56FE\u7247"
  });
  pasteZone.tabIndex = 0;
  const buttonRow = imageField.createDiv({ cls: "coffee-tracker-image-actions" });
  const focusBtn = buttonRow.createEl("button", {
    cls: "coffee-tracker-btn",
    text: "\u51C6\u5907\u7C98\u8D34"
  });
  const clearBtn = buttonRow.createEl("button", {
    cls: "coffee-tracker-btn",
    text: "\u6E05\u7A7A\u56FE\u7247"
  });
  const updateValue = (value) => {
    currentValue = value.trim();
    onChange(currentValue);
    if (pathInput && pathInput.getValue() !== currentValue) {
      pathInput.setValue(currentValue);
    }
    renderPreview();
    updateButtons();
  };
  const updateButtons = () => {
    clearBtn.disabled = !currentValue;
  };
  const renderPreview = () => {
    preview.empty();
    if (!currentValue) {
      preview.addClass("is-empty");
      preview.createDiv({
        cls: "coffee-tracker-image-placeholder",
        text: "\u8FD8\u6CA1\u6709\u56FE\u7247"
      });
      return;
    }
    preview.removeClass("is-empty");
    const img = preview.createEl("img", {
      cls: "coffee-tracker-image-preview-img"
    });
    img.src = resolveImageSrc(app, currentValue);
    img.alt = "\u5496\u5561\u8C46\u56FE\u7247\u9884\u89C8";
    img.onerror = () => {
      preview.empty();
      preview.addClass("is-empty");
      preview.createDiv({
        cls: "coffee-tracker-image-placeholder",
        text: "\u56FE\u7247\u8DEF\u5F84\u65E0\u6548\uFF0C\u5DF2\u4FDD\u7559\u539F\u503C"
      });
    };
    preview.createDiv({
      cls: "coffee-tracker-image-path",
      text: currentValue
    });
  };
  const saveClipboardImage = async (imageFile) => {
    try {
      const savedPath = await saveImageBlobToVault(
        app,
        imageFile,
        getSuggestedName == null ? void 0 : getSuggestedName()
      );
      updateValue(savedPath);
      new import_obsidian.Notice(`\u56FE\u7247\u5DF2\u4FDD\u5B58\u5230 ${savedPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "\u4FDD\u5B58\u56FE\u7247\u5931\u8D25";
      new import_obsidian.Notice(message);
    }
  };
  pasteZone.addEventListener("click", () => {
    pasteZone.focus();
  });
  pasteZone.addEventListener("paste", async (evt) => {
    const imageFile = await extractImageFromClipboard(evt);
    if (!imageFile) {
      new import_obsidian.Notice("\u526A\u8D34\u677F\u91CC\u6CA1\u6709\u56FE\u7247");
      return;
    }
    evt.preventDefault();
    await saveClipboardImage(imageFile);
  });
  focusBtn.addEventListener("click", () => {
    pasteZone.focus();
    new import_obsidian.Notice("\u73B0\u5728\u53EF\u4EE5\u76F4\u63A5\u7C98\u8D34\u56FE\u7247");
  });
  clearBtn.addEventListener("click", () => {
    updateValue("");
  });
  renderPreview();
  updateButtons();
}
var import_obsidian, IMAGE_FOLDER;
var init_beanImage = __esm({
  "src/utils/beanImage.ts"() {
    import_obsidian = require("obsidian");
    IMAGE_FOLDER = "Coffee Bean Tracker/Images";
  }
});

// src/modals/EditBeanModal.ts
var EditBeanModal_exports = {};
__export(EditBeanModal_exports, {
  EditBeanModal: () => EditBeanModal
});
var import_obsidian2, EditBeanModal;
var init_EditBeanModal = __esm({
  "src/modals/EditBeanModal.ts"() {
    import_obsidian2 = require("obsidian");
    init_beanImage();
    EditBeanModal = class extends import_obsidian2.Modal {
      constructor(app, plugin, bean, onSave) {
        super(app);
        this.plugin = plugin;
        this.bean = bean;
        this.onSave = onSave;
      }
      onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("coffee-tracker-modal");
        contentEl.createEl("h3", { text: "\u7F16\u8F91\u5496\u5561\u8C46" });
        const form = {
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
          roastDate: this.bean.roastDate
        };
        const fields = [
          { key: "name", label: "\u54C1\u540D" },
          { key: "origin", label: "\u4EA7\u5730" },
          { key: "roaster", label: "\u70D8\u7119\u5546" },
          { key: "price", label: "\u4EF7\u683C (\xA5)", type: "number" },
          { key: "totalWeight", label: "\u603B\u514B\u91CD (g)", type: "number" },
          { key: "remaining", label: "\u4F59\u91CF (g)", type: "number" },
          { key: "rating", label: "\u8BC4\u5206 (1-10)", type: "number" },
          { key: "comment", label: "\u7B80\u8BC4" },
          { key: "purchaseDate", label: "\u8D2D\u5165\u65E5\u671F", type: "date" },
          { key: "roastDate", label: "\u70D8\u7119\u65E5\u671F", type: "date" }
        ];
        for (const f of fields) {
          new import_obsidian2.Setting(contentEl).setName(f.label).addText((text) => {
            if (f.type === "number") text.inputEl.type = "number";
            if (f.type === "date") text.inputEl.type = "date";
            text.setValue(form[f.key]);
            text.onChange((v) => {
              form[f.key] = v;
            });
          });
          if (f.key === "name") {
            renderBeanImageField({
              containerEl: contentEl,
              app: this.app,
              value: form.image,
              onChange: (value) => {
                form.image = value;
              },
              getSuggestedName: () => form.name
            });
          }
        }
        const btnRow = new import_obsidian2.Setting(contentEl);
        btnRow.addButton((btn) => {
          btn.setButtonText("\u4FDD\u5B58").setCta().onClick(async () => {
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
              roastDate: form.roastDate
            });
            this.close();
            this.onSave();
          });
        });
        btnRow.addButton((btn) => {
          btn.setButtonText("\u5220\u9664").setWarning().onClick(async () => {
            await this.plugin.dataManager.deleteBean(this.bean.id);
            this.close();
            this.onSave();
          });
        });
      }
      onClose() {
        this.contentEl.empty();
      }
    };
  }
});

// src/modals/HistoryModal.ts
var HistoryModal_exports = {};
__export(HistoryModal_exports, {
  HistoryModal: () => HistoryModal
});
var import_obsidian3, HistoryModal;
var init_HistoryModal = __esm({
  "src/modals/HistoryModal.ts"() {
    import_obsidian3 = require("obsidian");
    HistoryModal = class extends import_obsidian3.Modal {
      constructor(app, plugin, bean) {
        super(app);
        this.plugin = plugin;
        this.bean = bean;
      }
      onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("coffee-tracker-modal");
        contentEl.createEl("h3", { text: `${this.bean.name} \u2014 \u6D88\u8D39\u8BB0\u5F55` });
        const records = this.plugin.dataManager.getHistory(this.bean.id);
        if (records.length === 0) {
          contentEl.createDiv({ text: "\u6682\u65E0\u6D88\u8D39\u8BB0\u5F55", cls: "coffee-tracker-empty" });
          return;
        }
        const table = contentEl.createEl("table", { cls: "coffee-tracker-table coffee-tracker-history-table" });
        const thead = table.createEl("thead");
        const headerRow = thead.createEl("tr");
        headerRow.createEl("th", { text: "\u65F6\u95F4" });
        headerRow.createEl("th", { text: "\u7528\u91CF" });
        headerRow.createEl("th", { text: "\u65B9\u5F0F" });
        const tbody = table.createEl("tbody");
        let totalConsumed = 0;
        for (const record of records) {
          const tr = tbody.createEl("tr");
          const date = new Date(record.timestamp);
          tr.createEl("td", { text: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` });
          tr.createEl("td", { text: `${record.amount}g` });
          tr.createEl("td", { text: record.presetLabel });
          totalConsumed += record.amount;
        }
        contentEl.createDiv({
          cls: "coffee-tracker-history-summary",
          text: `\u5171\u6D88\u8D39 ${records.length} \u6B21\uFF0C\u5408\u8BA1 ${totalConsumed}g`
        });
      }
      onClose() {
        this.contentEl.empty();
      }
    };
  }
});

// src/modals/AddBeanModal.ts
var AddBeanModal_exports = {};
__export(AddBeanModal_exports, {
  AddBeanModal: () => AddBeanModal
});
var import_obsidian6, AddBeanModal;
var init_AddBeanModal = __esm({
  "src/modals/AddBeanModal.ts"() {
    import_obsidian6 = require("obsidian");
    init_beanImage();
    AddBeanModal = class extends import_obsidian6.Modal {
      constructor(app, plugin, onSave) {
        super(app);
        this.plugin = plugin;
        this.onSave = onSave;
      }
      onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("coffee-tracker-modal");
        contentEl.createEl("h3", { text: "\u6DFB\u52A0\u5496\u5561\u8C46" });
        const form = {
          name: "",
          image: "",
          origin: "",
          roaster: "",
          price: "",
          totalWeight: "",
          rating: "7",
          comment: "",
          purchaseDate: "",
          roastDate: ""
        };
        const fields = [
          { key: "name", label: "\u54C1\u540D", placeholder: "Ethiopia Yirgacheffe" },
          { key: "origin", label: "\u4EA7\u5730", placeholder: "Ethiopia" },
          { key: "roaster", label: "\u70D8\u7119\u5546", placeholder: "SEE" },
          { key: "price", label: "\u4EF7\u683C (\xA5)", type: "number", placeholder: "128" },
          { key: "totalWeight", label: "\u603B\u514B\u91CD (g)", type: "number", placeholder: "250" },
          { key: "rating", label: "\u8BC4\u5206 (1-10)", type: "number", placeholder: "7" },
          { key: "comment", label: "\u7B80\u8BC4", placeholder: "\u82B1\u9999\u660E\u663E\uFF0C\u9178\u751C\u5E73\u8861" },
          { key: "purchaseDate", label: "\u8D2D\u5165\u65E5\u671F", type: "date" },
          { key: "roastDate", label: "\u70D8\u7119\u65E5\u671F", type: "date" }
        ];
        for (const f of fields) {
          new import_obsidian6.Setting(contentEl).setName(f.label).addText((text) => {
            if (f.type === "number") text.inputEl.type = "number";
            if (f.type === "date") text.inputEl.type = "date";
            if (f.placeholder) text.setPlaceholder(f.placeholder);
            text.onChange((v) => {
              form[f.key] = v;
            });
          });
          if (f.key === "name") {
            renderBeanImageField({
              containerEl: contentEl,
              app: this.app,
              value: form.image,
              onChange: (value) => {
                form.image = value;
              },
              getSuggestedName: () => form.name
            });
          }
        }
        new import_obsidian6.Setting(contentEl).addButton((btn) => {
          btn.setButtonText("\u4FDD\u5B58").setCta().onClick(async () => {
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
              roastDate: form.roastDate
            });
            this.close();
            this.onSave();
          });
        });
      }
      onClose() {
        this.contentEl.empty();
      }
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => CoffeeBeanTrackerPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian9 = require("obsidian");

// src/types.ts
var DEFAULT_SETTINGS = {
  presets: [
    { label: "\u5355\u676F", amount: 15 },
    { label: "\u53CC\u676F", amount: 30 }
  ],
  defaultView: "kanban",
  showArchived: false
};
var DEFAULT_DATA = {
  settings: DEFAULT_SETTINGS,
  beans: [],
  history: []
};
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function getPricePerGram(bean) {
  if (bean.totalWeight <= 0) return 0;
  return bean.price / bean.totalWeight;
}

// src/data.ts
var DataManager = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.data = DEFAULT_DATA;
  }
  async load() {
    const saved = await this.plugin.loadData();
    if (saved) {
      this.data = {
        settings: { ...DEFAULT_SETTINGS, ...saved.settings },
        beans: saved.beans || [],
        history: saved.history || []
      };
    }
  }
  async save() {
    await this.plugin.saveData(this.data);
  }
  async addBean(bean) {
    const newBean = {
      ...bean,
      id: generateId(),
      archived: false
    };
    this.data.beans.push(newBean);
    await this.save();
    return newBean;
  }
  async updateBean(id, updates) {
    const idx = this.data.beans.findIndex((b) => b.id === id);
    if (idx === -1) return;
    this.data.beans[idx] = { ...this.data.beans[idx], ...updates };
    await this.save();
  }
  async deleteBean(id) {
    this.data.beans = this.data.beans.filter((b) => b.id !== id);
    this.data.history = this.data.history.filter((h) => h.beanId !== id);
    await this.save();
  }
  async deduct(beanId, preset) {
    const bean = this.data.beans.find((b) => b.id === beanId);
    if (!bean || bean.remaining < preset.amount) return false;
    bean.remaining -= preset.amount;
    if (bean.remaining <= 0) {
      bean.remaining = 0;
      bean.archived = true;
    }
    const record = {
      id: generateId(),
      beanId,
      amount: preset.amount,
      presetLabel: preset.label,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.history.push(record);
    await this.save();
    return true;
  }
  getHistory(beanId) {
    return this.data.history.filter((h) => h.beanId === beanId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
  getBeans(showArchived) {
    if (showArchived) return this.data.beans;
    return this.data.beans.filter((b) => !b.archived);
  }
};

// src/views/CoffeeView.ts
var import_obsidian7 = require("obsidian");

// src/views/KanbanRenderer.ts
var import_obsidian4 = require("obsidian");
var KanbanRenderer = class {
  constructor(container, beans, plugin, onRefresh) {
    this.container = container;
    this.beans = beans;
    this.plugin = plugin;
    this.onRefresh = onRefresh;
  }
  render() {
    const grid = this.container.createDiv({ cls: "coffee-tracker-grid" });
    if (this.beans.length === 0) {
      grid.createDiv({ cls: "coffee-tracker-empty", text: "\u8FD8\u6CA1\u6709\u5496\u5561\u8C46\uFF0C\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u6DFB\u52A0" });
      return;
    }
    for (const bean of this.beans) {
      this.renderCard(grid, bean);
    }
  }
  renderCard(grid, bean) {
    const card = grid.createDiv({ cls: "coffee-tracker-card" });
    if (bean.archived) card.addClass("coffee-tracker-card-archived");
    if (bean.image) {
      const imgContainer = card.createDiv({ cls: "coffee-tracker-card-img" });
      const img = imgContainer.createEl("img");
      if (bean.image.startsWith("http")) {
        img.src = bean.image;
      } else {
        const resourcePath = this.plugin.app.vault.adapter.getResourcePath(bean.image);
        img.src = resourcePath;
      }
      img.alt = bean.name;
      img.onerror = () => {
        imgContainer.empty();
        imgContainer.createDiv({ cls: "coffee-tracker-card-img-placeholder", text: "\u2615" });
      };
    }
    const info = card.createDiv({ cls: "coffee-tracker-card-info" });
    info.createDiv({ cls: "coffee-tracker-card-name", text: bean.name });
    const details = info.createDiv({ cls: "coffee-tracker-card-details" });
    if (bean.origin) details.createDiv({ text: `\u4EA7\u5730: ${bean.origin}` });
    if (bean.roaster) details.createDiv({ text: `\u70D8\u7119\u5546: ${bean.roaster}` });
    const progressContainer = info.createDiv({ cls: "coffee-tracker-progress-container" });
    const ratio = bean.totalWeight > 0 ? bean.remaining / bean.totalWeight : 0;
    const progressBar = progressContainer.createDiv({ cls: "coffee-tracker-progress-bar" });
    const progressFill = progressBar.createDiv({ cls: "coffee-tracker-progress-fill" });
    progressFill.style.width = `${ratio * 100}%`;
    if (ratio < 0.2) progressFill.addClass("coffee-tracker-progress-low");
    progressContainer.createDiv({
      cls: "coffee-tracker-progress-text",
      text: `${bean.remaining}g / ${bean.totalWeight}g`
    });
    const meta = info.createDiv({ cls: "coffee-tracker-card-meta" });
    const ppg = getPricePerGram(bean);
    meta.createSpan({ text: `\xA5${ppg.toFixed(2)}/g` });
    meta.createSpan({ text: `\u8BC4\u5206: ${bean.rating}/10` });
    const actions = card.createDiv({ cls: "coffee-tracker-card-actions" });
    const presets = this.plugin.dataManager.data.settings.presets;
    for (const preset of presets) {
      const btn = actions.createEl("button", {
        cls: "coffee-tracker-btn coffee-tracker-btn-deduct",
        text: `${preset.label} -${preset.amount}g`
      });
      btn.addEventListener("click", async () => {
        const success = await this.plugin.dataManager.deduct(bean.id, preset);
        if (success) {
          new import_obsidian4.Notice(`${bean.name}: -${preset.amount}g`);
          this.onRefresh();
        } else {
          new import_obsidian4.Notice("\u4F59\u91CF\u4E0D\u8DB3\uFF01");
        }
      });
    }
    const bottomActions = card.createDiv({ cls: "coffee-tracker-card-bottom" });
    const editBtn = bottomActions.createEl("button", { cls: "coffee-tracker-btn-link", text: "\u7F16\u8F91" });
    editBtn.addEventListener("click", () => {
      const { EditBeanModal: EditBeanModal2 } = (init_EditBeanModal(), __toCommonJS(EditBeanModal_exports));
      new EditBeanModal2(this.plugin.app, this.plugin, bean, () => this.onRefresh()).open();
    });
    const historyBtn = bottomActions.createEl("button", { cls: "coffee-tracker-btn-link", text: "\u5386\u53F2" });
    historyBtn.addEventListener("click", () => {
      const { HistoryModal: HistoryModal2 } = (init_HistoryModal(), __toCommonJS(HistoryModal_exports));
      new HistoryModal2(this.plugin.app, this.plugin, bean).open();
    });
  }
};

// src/views/TableRenderer.ts
var import_obsidian5 = require("obsidian");
var TableRenderer = class {
  constructor(container, beans, plugin, onRefresh) {
    this.sortField = null;
    this.sortAsc = true;
    this.container = container;
    this.beans = beans;
    this.plugin = plugin;
    this.onRefresh = onRefresh;
  }
  render() {
    if (this.beans.length === 0) {
      this.container.createDiv({ cls: "coffee-tracker-empty", text: "\u8FD8\u6CA1\u6709\u5496\u5561\u8C46\uFF0C\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u6DFB\u52A0" });
      return;
    }
    const sorted = this.getSortedBeans();
    const wrapper = this.container.createDiv({ cls: "coffee-tracker-table-wrapper" });
    const table = wrapper.createEl("table", { cls: "coffee-tracker-table" });
    this.renderHeader(table);
    this.renderBody(table, sorted);
  }
  getSortedBeans() {
    if (!this.sortField) return [...this.beans];
    const field = this.sortField;
    const dir = this.sortAsc ? 1 : -1;
    return [...this.beans].sort((a, b) => {
      const va = a[field];
      const vb = b[field];
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }
  renderHeader(table) {
    const thead = table.createEl("thead");
    const tr = thead.createEl("tr");
    const columns = [
      { label: "\u54C1\u540D", field: "name" },
      { label: "\u4EA7\u5730", field: "origin" },
      { label: "\u70D8\u7119\u5546", field: "roaster" },
      { label: "\u4EF7\u683C", field: "price" },
      { label: "\u603B\u514B\u91CD", field: "totalWeight" },
      { label: "\u4F59\u91CF", field: "remaining" },
      { label: "\u514B\u4EF7" },
      { label: "\u8BC4\u5206", field: "rating" },
      { label: "\u7B80\u8BC4" },
      { label: "\u8D2D\u5165\u65E5\u671F", field: "purchaseDate" },
      { label: "\u70D8\u7119\u65E5\u671F", field: "roastDate" },
      { label: "\u64CD\u4F5C" }
    ];
    for (const col of columns) {
      const th = tr.createEl("th", { text: col.label });
      if (col.field) {
        th.addClass("coffee-tracker-sortable");
        if (this.sortField === col.field) {
          th.addClass(this.sortAsc ? "sort-asc" : "sort-desc");
        }
        th.addEventListener("click", () => {
          if (this.sortField === col.field) {
            this.sortAsc = !this.sortAsc;
          } else {
            this.sortField = col.field;
            this.sortAsc = true;
          }
          this.container.empty();
          this.render();
        });
      }
    }
  }
  renderBody(table, beans) {
    const tbody = table.createEl("tbody");
    for (const bean of beans) {
      this.renderRow(tbody, bean);
    }
  }
  renderRow(tbody, bean) {
    const tr = tbody.createEl("tr");
    if (bean.archived) tr.addClass("coffee-tracker-row-archived");
    this.editableCell(tr, bean, "name", "text");
    this.editableCell(tr, bean, "origin", "text");
    this.editableCell(tr, bean, "roaster", "text");
    this.editableCell(tr, bean, "price", "number");
    this.editableCell(tr, bean, "totalWeight", "number");
    this.editableCell(tr, bean, "remaining", "number");
    const ppgCell = tr.createEl("td", { text: `\xA5${getPricePerGram(bean).toFixed(2)}` });
    ppgCell.addClass("coffee-tracker-cell-readonly");
    this.editableCell(tr, bean, "rating", "number");
    this.editableCell(tr, bean, "comment", "text");
    this.editableCell(tr, bean, "purchaseDate", "date");
    this.editableCell(tr, bean, "roastDate", "date");
    const actionCell = tr.createEl("td", { cls: "coffee-tracker-cell-actions" });
    const presets = this.plugin.dataManager.data.settings.presets;
    for (const preset of presets) {
      const btn = actionCell.createEl("button", {
        cls: "coffee-tracker-btn coffee-tracker-btn-deduct-sm",
        text: `-${preset.amount}g`
      });
      btn.addEventListener("click", async () => {
        const success = await this.plugin.dataManager.deduct(bean.id, preset);
        if (success) {
          new import_obsidian5.Notice(`${bean.name}: -${preset.amount}g`);
          this.onRefresh();
        } else {
          new import_obsidian5.Notice("\u4F59\u91CF\u4E0D\u8DB3\uFF01");
        }
      });
    }
    const historyBtn = actionCell.createEl("button", { cls: "coffee-tracker-btn-link", text: "\u5386\u53F2" });
    historyBtn.addEventListener("click", () => {
      const { HistoryModal: HistoryModal2 } = (init_HistoryModal(), __toCommonJS(HistoryModal_exports));
      new HistoryModal2(this.plugin.app, this.plugin, bean).open();
    });
  }
  editableCell(tr, bean, field, inputType) {
    const value = bean[field];
    const td = tr.createEl("td", { text: String(value != null ? value : "") });
    td.addClass("coffee-tracker-cell-editable");
    td.addEventListener("dblclick", () => {
      td.empty();
      const input = td.createEl("input", { type: inputType });
      input.value = String(value != null ? value : "");
      input.addClass("coffee-tracker-cell-input");
      input.focus();
      input.select();
      const save = async () => {
        let newValue = input.value;
        if (inputType === "number") {
          newValue = parseFloat(input.value) || 0;
        }
        if (newValue !== value) {
          await this.plugin.dataManager.updateBean(bean.id, { [field]: newValue });
          this.onRefresh();
        } else {
          td.empty();
          td.textContent = String(value != null ? value : "");
        }
      };
      input.addEventListener("blur", save);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") {
          td.empty();
          td.textContent = String(value != null ? value : "");
        }
      });
    });
  }
};

// src/views/CoffeeView.ts
var VIEW_TYPE_COFFEE = "coffee-bean-tracker";
var CoffeeView = class extends import_obsidian7.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.currentView = plugin.dataManager.data.settings.defaultView;
    this.showArchived = plugin.dataManager.data.settings.showArchived;
    this.contentEl_ = createDiv();
  }
  getViewType() {
    return VIEW_TYPE_COFFEE;
  }
  getDisplayText() {
    return "\u5496\u5561\u8C46\u5E93\u5B58";
  }
  getIcon() {
    return "coffee";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("coffee-tracker-container");
    const toolbar = container.createDiv({ cls: "coffee-tracker-toolbar" });
    this.buildToolbar(toolbar);
    this.contentEl_ = container.createDiv({ cls: "coffee-tracker-content" });
    this.refresh();
  }
  buildToolbar(toolbar) {
    const leftGroup = toolbar.createDiv({ cls: "coffee-tracker-toolbar-left" });
    const rightGroup = toolbar.createDiv({ cls: "coffee-tracker-toolbar-right" });
    const viewToggle = leftGroup.createEl("button", {
      cls: "coffee-tracker-btn",
      text: this.currentView === "kanban" ? "\u5207\u6362\u8868\u683C" : "\u5207\u6362\u770B\u677F"
    });
    viewToggle.addEventListener("click", () => {
      this.currentView = this.currentView === "kanban" ? "table" : "kanban";
      viewToggle.textContent = this.currentView === "kanban" ? "\u5207\u6362\u8868\u683C" : "\u5207\u6362\u770B\u677F";
      this.plugin.dataManager.data.settings.defaultView = this.currentView;
      this.plugin.dataManager.save();
      this.refresh();
    });
    const archiveToggle = leftGroup.createEl("label", { cls: "coffee-tracker-checkbox-label" });
    const checkbox = archiveToggle.createEl("input", { type: "checkbox" });
    checkbox.checked = this.showArchived;
    checkbox.addEventListener("change", () => {
      this.showArchived = checkbox.checked;
      this.plugin.dataManager.data.settings.showArchived = this.showArchived;
      this.plugin.dataManager.save();
      this.refresh();
    });
    archiveToggle.appendText("\u663E\u793A\u5DF2\u7528\u5B8C");
    const addBtn = rightGroup.createEl("button", {
      cls: "coffee-tracker-btn coffee-tracker-btn-primary",
      text: "+ \u6DFB\u52A0\u5496\u5561\u8C46"
    });
    addBtn.addEventListener("click", () => {
      const { AddBeanModal: AddBeanModal2 } = (init_AddBeanModal(), __toCommonJS(AddBeanModal_exports));
      new AddBeanModal2(this.app, this.plugin, () => this.refresh()).open();
    });
  }
  refresh() {
    this.contentEl_.empty();
    const beans = this.plugin.dataManager.getBeans(this.showArchived);
    if (this.currentView === "kanban") {
      new KanbanRenderer(this.contentEl_, beans, this.plugin, () => this.refresh()).render();
    } else {
      new TableRenderer(this.contentEl_, beans, this.plugin, () => this.refresh()).render();
    }
  }
  async onClose() {
  }
};

// src/settings.ts
var import_obsidian8 = require("obsidian");
var CoffeeTrackerSettingTab = class extends import_obsidian8.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "\u5496\u5561\u8C46\u5E93\u5B58\u8BBE\u7F6E" });
    containerEl.createEl("h3", { text: "\u6263\u51CF\u9884\u8BBE" });
    const presets = this.plugin.dataManager.data.settings.presets;
    for (let i = 0; i < presets.length; i++) {
      const preset = presets[i];
      new import_obsidian8.Setting(containerEl).setName(`\u9884\u8BBE ${i + 1}`).addText((text) => {
        text.setPlaceholder("\u540D\u79F0").setValue(preset.label);
        text.onChange((v) => {
          preset.label = v;
          this.plugin.dataManager.save();
        });
      }).addText((text) => {
        text.inputEl.type = "number";
        text.setPlaceholder("\u514B\u6570").setValue(String(preset.amount));
        text.onChange((v) => {
          preset.amount = parseInt(v) || 0;
          this.plugin.dataManager.save();
        });
      }).addButton((btn) => {
        btn.setIcon("trash").setWarning().onClick(() => {
          presets.splice(i, 1);
          this.plugin.dataManager.save();
          this.display();
        });
      });
    }
    new import_obsidian8.Setting(containerEl).addButton((btn) => {
      btn.setButtonText("+ \u6DFB\u52A0\u9884\u8BBE").onClick(() => {
        presets.push({ label: "\u65B0\u9884\u8BBE", amount: 15 });
        this.plugin.dataManager.save();
        this.display();
      });
    });
    containerEl.createEl("h3", { text: "\u9ED8\u8BA4\u89C6\u56FE" });
    new import_obsidian8.Setting(containerEl).setName("\u6253\u5F00\u65F6\u7684\u9ED8\u8BA4\u89C6\u56FE").addDropdown((drop) => {
      drop.addOption("kanban", "\u770B\u677F");
      drop.addOption("table", "\u8868\u683C");
      drop.setValue(this.plugin.dataManager.data.settings.defaultView);
      drop.onChange((v) => {
        this.plugin.dataManager.data.settings.defaultView = v;
        this.plugin.dataManager.save();
      });
    });
  }
};

// src/main.ts
var CoffeeBeanTrackerPlugin = class extends import_obsidian9.Plugin {
  async onload() {
    this.dataManager = new DataManager(this);
    await this.dataManager.load();
    this.registerView(VIEW_TYPE_COFFEE, (leaf) => new CoffeeView(leaf, this));
    this.addRibbonIcon("cup-soda", "\u5496\u5561\u8C46\u5E93\u5B58", () => {
      this.activateView();
    });
    this.addCommand({
      id: "open-coffee-tracker",
      name: "\u6253\u5F00\u5496\u5561\u8C46\u5E93\u5B58",
      callback: () => this.activateView()
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
  onunload() {
  }
};
