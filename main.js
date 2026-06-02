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

// src/types.ts
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function normalizeDeductionPreset(preset, fallback = DEFAULT_DEDUCTION_PRESET) {
  const rawLabel = typeof (preset == null ? void 0 : preset.label) === "string" ? preset.label.trim() : "";
  const fallbackLabel = fallback.label.trim() || DEFAULT_DEDUCTION_PRESET.label;
  const label = rawLabel || fallbackLabel;
  const rawAmount = Number(preset == null ? void 0 : preset.amount);
  const fallbackAmount = Number.isFinite(fallback.amount) && fallback.amount > 0 ? fallback.amount : DEFAULT_DEDUCTION_PRESET.amount;
  const amount = Number.isFinite(rawAmount) && rawAmount > 0 ? rawAmount : fallbackAmount;
  return { label, amount };
}
function normalizeRatingInput(input, fallback = DEFAULT_RATING) {
  const parsed = parseRatingInput(input);
  if (parsed) return parsed;
  if (input !== fallback) {
    const fallbackParsed = parseRatingInput(fallback);
    if (fallbackParsed) return fallbackParsed;
  }
  return {
    value: DEFAULT_RATING,
    label: formatRatingNumber(DEFAULT_RATING)
  };
}
function formatRatingDisplay(bean) {
  return bean.ratingLabel.trim() || formatRatingNumber(bean.rating);
}
function parseRatingInput(input) {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) return null;
    const value = clampRating(input);
    return { value, label: formatRatingNumber(value) };
  }
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw) return null;
  const normalized = raw.replace(/[—–~～]/g, "-").replace(/\s+/g, "");
  const parts = normalized.split("-").filter(Boolean);
  if (parts.length === 2) {
    const start = Number(parts[0]);
    const end = Number(parts[1]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    const min = clampRating(Math.min(start, end));
    const max = clampRating(Math.max(start, end));
    return {
      value: (min + max) / 2,
      label: `${formatRatingNumber(min)}-${formatRatingNumber(max)}`
    };
  }
  if (parts.length === 1) {
    const value = Number(parts[0]);
    if (!Number.isFinite(value)) return null;
    const clamped = clampRating(value);
    return {
      value: clamped,
      label: formatRatingNumber(clamped)
    };
  }
  return null;
}
function clampRating(value) {
  return Math.min(MAX_RATING, Math.max(MIN_RATING, value));
}
function formatRatingNumber(value) {
  return value.toFixed(2).replace(/\.?0+$/, "");
}
function normalizeDisplayPrecision(precision, fallback = DEFAULT_DISPLAY_PRECISION) {
  const fallbackValue = Math.trunc(Number(fallback));
  const fallbackPrecision = Number.isFinite(fallbackValue) ? Math.min(MAX_DISPLAY_PRECISION, Math.max(MIN_DISPLAY_PRECISION, fallbackValue)) : DEFAULT_DISPLAY_PRECISION;
  const nextPrecision = Math.trunc(Number(precision));
  if (!Number.isFinite(nextPrecision)) return fallbackPrecision;
  return Math.min(MAX_DISPLAY_PRECISION, Math.max(MIN_DISPLAY_PRECISION, nextPrecision));
}
function normalizeSettings(settings) {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    displayPrecision: normalizeDisplayPrecision(settings == null ? void 0 : settings.displayPrecision)
  };
}
function formatDisplayNumber(value, precision) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0";
  const normalizedPrecision = normalizeDisplayPrecision(precision);
  const rounded = Number(numericValue.toFixed(normalizedPrecision));
  if (rounded === 0) return "0";
  const fixed = rounded.toFixed(normalizedPrecision);
  if (normalizedPrecision === 0) return fixed;
  return fixed.replace(/\.?0+$/, "");
}
function getPricePerGram(bean) {
  if (bean.totalWeight <= 0) return 0;
  return bean.price / bean.totalWeight;
}
var DEFAULT_DEDUCTION_PRESET, SETTLEMENT_PRESET_LABEL, DEFAULT_RATING, MIN_RATING, MAX_RATING, DEFAULT_DISPLAY_PRECISION, MIN_DISPLAY_PRECISION, MAX_DISPLAY_PRECISION, DEFAULT_SETTINGS, DEFAULT_DATA;
var init_types = __esm({
  "src/types.ts"() {
    DEFAULT_DEDUCTION_PRESET = {
      label: "\u5355\u676F",
      amount: 15
    };
    SETTLEMENT_PRESET_LABEL = "\u5E73\u8D26\u5F52\u6863";
    DEFAULT_RATING = 7;
    MIN_RATING = 0;
    MAX_RATING = 10;
    DEFAULT_DISPLAY_PRECISION = 2;
    MIN_DISPLAY_PRECISION = 0;
    MAX_DISPLAY_PRECISION = 4;
    DEFAULT_SETTINGS = {
      presets: [
        DEFAULT_DEDUCTION_PRESET,
        { label: "\u53CC\u676F", amount: 30 }
      ],
      defaultView: "kanban",
      showArchived: false,
      displayPrecision: DEFAULT_DISPLAY_PRECISION
    };
    DEFAULT_DATA = {
      settings: DEFAULT_SETTINGS,
      beans: [],
      history: []
    };
  }
});

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
  let isSaving = false;
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
    if (pathInput == null ? void 0 : pathInput.inputEl) {
      pathInput.inputEl.disabled = isSaving;
    }
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
    if (isSaving) return;
    isSaving = true;
    updateButtons();
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
    } finally {
      isSaving = false;
      updateButtons();
    }
  };
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
    init_types();
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
          process: this.bean.process,
          variety: this.bean.variety,
          roaster: this.bean.roaster,
          price: String(this.bean.price),
          totalWeight: String(this.bean.totalWeight),
          remaining: String(this.bean.remaining),
          rating: formatRatingDisplay(this.bean),
          flavor: this.bean.flavor,
          comment: this.bean.comment,
          purchaseDate: this.bean.purchaseDate,
          roastDate: this.bean.roastDate,
          openedDate: this.bean.openedDate,
          deductionLabel: this.bean.deductionPreset.label,
          deductionAmount: String(this.bean.deductionPreset.amount)
        };
        const fields = [
          { key: "name", label: "\u79CD\u690D\u5E84\u56ED / \u8C46\u540D" },
          { key: "origin", label: "\u4EA7\u5730" },
          { key: "process", label: "\u5904\u7406\u6CD5" },
          { key: "variety", label: "\u8C46\u79CD" },
          { key: "roaster", label: "\u70D8\u7119\u5546" },
          { key: "price", label: "\u4EF7\u683C (\xA5)", type: "number" },
          { key: "totalWeight", label: "\u603B\u514B\u91CD (g)", type: "number" },
          { key: "remaining", label: "\u4F59\u91CF (g)", type: "number" },
          { key: "rating", label: "\u8BC4\u5206 (10 \u5206\u5236)" },
          { key: "flavor", label: "\u98CE\u5473" },
          { key: "comment", label: "\u5907\u6CE8" },
          { key: "purchaseDate", label: "\u8D2D\u5165\u65E5\u671F", type: "date" },
          { key: "roastDate", label: "\u70D8\u7119\u65E5\u671F", type: "date" },
          { key: "openedDate", label: "\u5F00\u888B\u65E5\u671F", type: "date" },
          { key: "deductionLabel", label: "\u6263\u51CF\u9884\u8BBE\u540D\u79F0" },
          { key: "deductionAmount", label: "\u6263\u51CF\u9884\u8BBE\u514B\u6570 (g)", type: "number" }
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
            const deductionPreset = normalizeDeductionPreset({
              label: form.deductionLabel,
              amount: parseFloat(form.deductionAmount)
            }, this.bean.deductionPreset);
            const rating = normalizeRatingInput(form.rating, this.bean.ratingLabel || this.bean.rating);
            await this.plugin.dataManager.updateBean(this.bean.id, {
              name: form.name,
              image: form.image,
              origin: form.origin,
              process: form.process,
              variety: form.variety,
              roaster: form.roaster,
              price: parseFloat(form.price) || 0,
              totalWeight: parseFloat(form.totalWeight) || 0,
              remaining: parseFloat(form.remaining) || 0,
              rating: rating.value,
              ratingLabel: rating.label,
              flavor: form.flavor,
              comment: form.comment,
              purchaseDate: form.purchaseDate,
              roastDate: form.roastDate,
              openedDate: form.openedDate,
              deductionPreset
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
    init_types();
    HistoryModal = class extends import_obsidian3.Modal {
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
        headerRow.createEl("th", { text: "\u64CD\u4F5C" });
        const tbody = table.createEl("tbody");
        let totalConsumed = 0;
        for (const record of records) {
          const tr = tbody.createEl("tr");
          const date = new Date(record.timestamp);
          tr.createEl("td", { text: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` });
          const amountTd = tr.createEl("td");
          const amountSpan = amountTd.createSpan({ text: `${this.formatNumber(record.amount)}g` });
          tr.createEl("td", { text: record.presetLabel });
          const actionsTd = tr.createEl("td");
          actionsTd.addClass("coffee-tracker-history-actions");
          const editBtn = actionsTd.createEl("button", { text: "\u7F16\u8F91", cls: "coffee-tracker-history-btn-edit" });
          editBtn.addEventListener("click", () => {
            if (amountTd.querySelector("input")) return;
            amountSpan.style.display = "none";
            const input = amountTd.createEl("input", {
              cls: "coffee-tracker-history-input",
              attr: { type: "number", step: "0.1", value: String(record.amount) }
            });
            input.focus();
            input.select();
            const save = async () => {
              const val = parseFloat(input.value);
              if (!Number.isFinite(val) || val <= 0) {
                new import_obsidian3.Notice("\u514B\u6570\u5FC5\u987B\u5927\u4E8E 0");
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
                new import_obsidian3.Notice("\u4F59\u91CF\u8D85\u51FA\u8303\u56F4\uFF0C\u65E0\u6CD5\u8C03\u6574");
                cancel();
              }
            };
            const cancel = () => {
              input.remove();
              amountSpan.style.display = "";
            };
            input.addEventListener("blur", () => void save());
            input.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void save();
              }
              if (e.key === "Escape") {
                cancel();
              }
            });
          });
          const deleteBtn = actionsTd.createEl("button", { text: "\u5220\u9664", cls: "coffee-tracker-history-btn-delete" });
          deleteBtn.addEventListener("click", async () => {
            if (!window.confirm("\u786E\u8BA4\u5220\u9664\u8FD9\u6761\u6D88\u8D39\u8BB0\u5F55\uFF1F")) return;
            const success = await this.plugin.dataManager.deleteHistoryRecord(record.id);
            if (success) {
              this.onSave();
              this.refresh();
            }
          });
          totalConsumed += record.amount;
        }
        contentEl.createDiv({
          cls: "coffee-tracker-history-summary",
          text: `\u5171\u6D88\u8D39 ${records.length} \u6B21\uFF0C\u5408\u8BA1 ${this.formatNumber(totalConsumed)}g`
        });
      }
      refresh() {
        this.contentEl.empty();
        this.onOpen();
      }
      onClose() {
        this.contentEl.empty();
      }
      formatNumber(value) {
        return formatDisplayNumber(value, this.plugin.dataManager.data.settings.displayPrecision);
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
    init_types();
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
          process: "",
          variety: "",
          roaster: "",
          price: "",
          totalWeight: "",
          rating: "7",
          flavor: "",
          comment: "",
          purchaseDate: "",
          roastDate: "",
          openedDate: "",
          deductionLabel: DEFAULT_DEDUCTION_PRESET.label,
          deductionAmount: String(DEFAULT_DEDUCTION_PRESET.amount)
        };
        const fields = [
          { key: "name", label: "\u79CD\u690D\u5E84\u56ED / \u8C46\u540D", placeholder: "El Miraflor" },
          { key: "origin", label: "\u4EA7\u5730", placeholder: "Ethiopia" },
          { key: "process", label: "\u5904\u7406\u6CD5", placeholder: "\u6C34\u6D17 / \u65E5\u6652 / \u871C\u5904\u7406" },
          { key: "variety", label: "\u8C46\u79CD", placeholder: "Geisha / SL28 / Bourbon" },
          { key: "roaster", label: "\u70D8\u7119\u5546", placeholder: "SEE" },
          { key: "price", label: "\u4EF7\u683C (\xA5)", type: "number", placeholder: "128" },
          { key: "totalWeight", label: "\u603B\u514B\u91CD (g)", type: "number", placeholder: "250" },
          { key: "rating", label: "\u8BC4\u5206 (10 \u5206\u5236)", placeholder: "8.25 \u6216 8.25-8.5" },
          { key: "flavor", label: "\u98CE\u5473", placeholder: "\u82B1\u9999\uFF0C\u67D1\u6A58\uFF0C\u8336\u611F" },
          { key: "comment", label: "\u5907\u6CE8", placeholder: "\u8403\u53D6\u5EFA\u8BAE\u3001\u996E\u7528\u611F\u53D7" },
          { key: "purchaseDate", label: "\u8D2D\u5165\u65E5\u671F", type: "date" },
          { key: "roastDate", label: "\u70D8\u7119\u65E5\u671F", type: "date" },
          { key: "openedDate", label: "\u5F00\u888B\u65E5\u671F", type: "date" },
          { key: "deductionLabel", label: "\u6263\u51CF\u9884\u8BBE\u540D\u79F0", placeholder: "\u5355\u676F" },
          { key: "deductionAmount", label: "\u6263\u51CF\u9884\u8BBE\u514B\u6570 (g)", type: "number", placeholder: "15" }
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
            const deductionPreset = normalizeDeductionPreset({
              label: form.deductionLabel,
              amount: parseFloat(form.deductionAmount)
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
              deductionPreset
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

// src/data.ts
init_types();
var DataManager = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.data = DEFAULT_DATA;
  }
  async load() {
    var _a, _b;
    const saved = await this.plugin.loadData();
    if (saved) {
      const fallbackPreset = normalizeDeductionPreset((_b = (_a = saved.settings) == null ? void 0 : _a.presets) == null ? void 0 : _b[0], DEFAULT_DEDUCTION_PRESET);
      const beans = (saved.beans || []).map((bean) => {
        const rating = normalizeRatingInput(bean.ratingLabel || bean.rating);
        return {
          ...bean,
          image: bean.image || "",
          origin: bean.origin || "",
          process: bean.process || "",
          variety: bean.variety || "",
          roaster: bean.roaster || "",
          price: Number(bean.price) || 0,
          totalWeight: Number(bean.totalWeight) || 0,
          remaining: Number(bean.remaining) || 0,
          rating: rating.value,
          ratingLabel: rating.label,
          flavor: bean.flavor || "",
          comment: bean.comment || "",
          purchaseDate: bean.purchaseDate || "",
          roastDate: bean.roastDate || "",
          openedDate: bean.openedDate || "",
          deductionPreset: normalizeDeductionPreset(bean.deductionPreset, fallbackPreset),
          archived: Boolean(bean.archived)
        };
      });
      this.data = {
        settings: normalizeSettings(saved.settings),
        beans,
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
    const nextBean = {
      ...this.data.beans[idx],
      ...updates
    };
    nextBean.deductionPreset = normalizeDeductionPreset(
      nextBean.deductionPreset,
      this.data.beans[idx].deductionPreset || DEFAULT_DEDUCTION_PRESET
    );
    this.data.beans[idx] = nextBean;
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
  async settleBean(beanId) {
    const bean = this.data.beans.find((b) => b.id === beanId);
    if (!bean) return false;
    const amount = bean.remaining;
    bean.remaining = 0;
    bean.archived = true;
    if (amount > 0) {
      const record = {
        id: generateId(),
        beanId,
        amount,
        presetLabel: SETTLEMENT_PRESET_LABEL,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.data.history.push(record);
    }
    await this.save();
    return true;
  }
  getHistory(beanId) {
    return this.data.history.filter((h) => h.beanId === beanId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
  async deleteHistoryRecord(recordId) {
    const idx = this.data.history.findIndex((h) => h.id === recordId);
    if (idx === -1) return false;
    const record = this.data.history[idx];
    const bean = this.data.beans.find((b) => b.id === record.beanId);
    if (!bean) return false;
    const nextRemaining = bean.remaining + record.amount;
    if (nextRemaining > bean.totalWeight) return false;
    this.data.history.splice(idx, 1);
    bean.remaining = nextRemaining;
    if (bean.remaining > 0 && bean.archived) {
      bean.archived = false;
    }
    await this.save();
    return true;
  }
  async updateHistoryRecord(recordId, newAmount) {
    if (!Number.isFinite(newAmount) || newAmount <= 0) return false;
    const record = this.data.history.find((h) => h.id === recordId);
    if (!record) return false;
    const bean = this.data.beans.find((b) => b.id === record.beanId);
    if (!bean) return false;
    const diff = newAmount - record.amount;
    const nextRemaining = bean.remaining - diff;
    if (nextRemaining < 0 || nextRemaining > bean.totalWeight) return false;
    record.amount = newAmount;
    bean.remaining = nextRemaining;
    bean.archived = bean.remaining === 0;
    await this.save();
    return true;
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
init_types();
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
    if (bean.process) details.createDiv({ text: `\u5904\u7406\u6CD5: ${bean.process}` });
    if (bean.variety) details.createDiv({ text: `\u8C46\u79CD: ${bean.variety}` });
    if (bean.roaster) details.createDiv({ text: `\u70D8\u7119\u5546: ${bean.roaster}` });
    if (bean.flavor) details.createDiv({ text: `\u98CE\u5473: ${bean.flavor}` });
    const progressContainer = info.createDiv({ cls: "coffee-tracker-progress-container" });
    const ratio = bean.totalWeight > 0 ? bean.remaining / bean.totalWeight : 0;
    const displayPrecision = this.plugin.dataManager.data.settings.displayPrecision;
    const progressBar = progressContainer.createDiv({ cls: "coffee-tracker-progress-bar" });
    const progressFill = progressBar.createDiv({ cls: "coffee-tracker-progress-fill" });
    progressFill.style.width = `${ratio * 100}%`;
    if (ratio < 0.2) progressFill.addClass("coffee-tracker-progress-low");
    progressContainer.createDiv({
      cls: "coffee-tracker-progress-text",
      text: `${formatDisplayNumber(bean.remaining, displayPrecision)}g / ${formatDisplayNumber(bean.totalWeight, displayPrecision)}g`
    });
    const meta = info.createDiv({ cls: "coffee-tracker-card-meta" });
    const ppg = getPricePerGram(bean);
    meta.createSpan({ text: `\xA5${formatDisplayNumber(ppg, displayPrecision)}/g` });
    meta.createSpan({ text: `\u8BC4\u5206: ${formatRatingDisplay(bean)}/10` });
    const actions = card.createDiv({ cls: "coffee-tracker-card-actions" });
    this.renderPresetEditor(actions, bean);
    const bottomActions = card.createDiv({ cls: "coffee-tracker-card-bottom" });
    const editBtn = bottomActions.createEl("button", { cls: "coffee-tracker-btn-link", text: "\u7F16\u8F91" });
    editBtn.addEventListener("click", () => {
      const { EditBeanModal: EditBeanModal2 } = (init_EditBeanModal(), __toCommonJS(EditBeanModal_exports));
      new EditBeanModal2(this.plugin.app, this.plugin, bean, () => this.onRefresh()).open();
    });
    const historyBtn = bottomActions.createEl("button", { cls: "coffee-tracker-btn-link", text: "\u5386\u53F2" });
    historyBtn.addEventListener("click", () => {
      const { HistoryModal: HistoryModal2 } = (init_HistoryModal(), __toCommonJS(HistoryModal_exports));
      new HistoryModal2(this.plugin.app, this.plugin, bean, () => this.onRefresh()).open();
    });
    if (!bean.archived && bean.remaining > 0) {
      const settleBtn = bottomActions.createEl("button", { cls: "coffee-tracker-btn-link coffee-tracker-btn-settle", text: "\u5E73\u8D26\u5F52\u6863" });
      settleBtn.addEventListener("click", async () => {
        await this.settleBean(bean);
      });
    }
  }
  renderPresetEditor(container, bean) {
    const wrapper = container.createDiv({ cls: "coffee-tracker-preset-editor" });
    wrapper.createDiv({ cls: "coffee-tracker-preset-label", text: "\u5E93\u5B58\u51CF\u5C11\u9884\u8BBE" });
    const fields = wrapper.createDiv({ cls: "coffee-tracker-preset-fields" });
    const labelInput = fields.createEl("input", {
      cls: "coffee-tracker-preset-input",
      type: "text",
      placeholder: "\u540D\u79F0"
    });
    labelInput.value = bean.deductionPreset.label;
    const amountGroup = fields.createDiv({ cls: "coffee-tracker-preset-amount-group" });
    const amountInput = amountGroup.createEl("input", {
      cls: "coffee-tracker-preset-input coffee-tracker-preset-input-amount",
      type: "number",
      placeholder: "\u514B\u6570"
    });
    amountInput.value = String(bean.deductionPreset.amount);
    amountInput.min = "1";
    amountInput.step = "1";
    amountGroup.createSpan({ cls: "coffee-tracker-preset-unit", text: "g" });
    const hint = wrapper.createDiv({
      cls: "coffee-tracker-preset-hint",
      text: "\u76F4\u63A5\u4FEE\u6539\u540D\u79F0\u6216\u514B\u6570\uFF0C\u4F1A\u81EA\u52A8\u4FDD\u5B58"
    });
    const actionBtn = wrapper.createEl("button", {
      cls: "coffee-tracker-btn coffee-tracker-btn-deduct"
    });
    let lastSavedPreset = normalizeDeductionPreset(bean.deductionPreset);
    let saveTimer = null;
    let isSaving = false;
    const getDraftPreset = () => normalizeDeductionPreset({
      label: labelInput.value,
      amount: parseFloat(amountInput.value)
    }, lastSavedPreset);
    const renderActionLabel = () => {
      const draft = getDraftPreset();
      actionBtn.textContent = `${draft.label} -${formatDisplayNumber(draft.amount, this.getDisplayPrecision())}g`;
    };
    const persistPreset = async (force = false) => {
      if (saveTimer !== null) {
        window.clearTimeout(saveTimer);
        saveTimer = null;
      }
      const nextPreset = getDraftPreset();
      labelInput.value = nextPreset.label;
      amountInput.value = String(nextPreset.amount);
      renderActionLabel();
      const changed = nextPreset.label !== lastSavedPreset.label || nextPreset.amount !== lastSavedPreset.amount;
      if (!changed) return lastSavedPreset;
      if (isSaving) return lastSavedPreset;
      isSaving = true;
      hint.textContent = "\u4FDD\u5B58\u4E2D...";
      try {
        await this.plugin.dataManager.updateBean(bean.id, { deductionPreset: nextPreset });
        bean.deductionPreset = nextPreset;
        lastSavedPreset = nextPreset;
        hint.textContent = "\u5DF2\u81EA\u52A8\u4FDD\u5B58";
      } catch (error) {
        hint.textContent = "\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5";
        new import_obsidian4.Notice(error instanceof Error ? error.message : "\u4FDD\u5B58\u9884\u8BBE\u5931\u8D25");
      } finally {
        isSaving = false;
      }
      return lastSavedPreset;
    };
    const scheduleSave = () => {
      renderActionLabel();
      hint.textContent = "\u6B63\u5728\u4FEE\u6539...";
      if (saveTimer !== null) {
        window.clearTimeout(saveTimer);
      }
      saveTimer = window.setTimeout(() => {
        void persistPreset();
      }, 300);
    };
    labelInput.addEventListener("input", scheduleSave);
    amountInput.addEventListener("input", scheduleSave);
    labelInput.addEventListener("blur", () => {
      void persistPreset(true);
    });
    amountInput.addEventListener("blur", () => {
      void persistPreset(true);
    });
    renderActionLabel();
    actionBtn.addEventListener("click", async () => {
      const preset = await persistPreset(true);
      const success = await this.plugin.dataManager.deduct(bean.id, preset);
      if (success) {
        new import_obsidian4.Notice(`${bean.name}: -${formatDisplayNumber(preset.amount, this.getDisplayPrecision())}g`);
        this.onRefresh();
      } else {
        new import_obsidian4.Notice("\u4F59\u91CF\u4E0D\u8DB3\uFF01");
      }
    });
  }
  getDisplayPrecision() {
    return this.plugin.dataManager.data.settings.displayPrecision;
  }
  async settleBean(bean) {
    const remaining = bean.remaining;
    const amountText = formatDisplayNumber(remaining, this.getDisplayPrecision());
    if (!window.confirm(`\u786E\u8BA4\u5C06\u300C${bean.name}\u300D\u4F59\u91CF ${amountText}g \u5E73\u8D26\u4E3A 0 \u5E76\u5F52\u6863\uFF1F`)) return;
    const success = await this.plugin.dataManager.settleBean(bean.id);
    if (success) {
      new import_obsidian4.Notice(`${bean.name}: \u5DF2\u5E73\u8D26\u5F52\u6863 ${amountText}g`);
      this.onRefresh();
    } else {
      new import_obsidian4.Notice("\u5E73\u8D26\u5F52\u6863\u5931\u8D25");
    }
  }
};

// src/views/TableRenderer.ts
var import_obsidian5 = require("obsidian");
init_types();
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
      { label: "\u5904\u7406\u6CD5", field: "process" },
      { label: "\u8C46\u79CD", field: "variety" },
      { label: "\u70D8\u7119\u5546", field: "roaster" },
      { label: "\u4EF7\u683C", field: "price" },
      { label: "\u603B\u514B\u91CD", field: "totalWeight" },
      { label: "\u4F59\u91CF", field: "remaining" },
      { label: "\u514B\u4EF7" },
      { label: "\u8BC4\u5206", field: "rating" },
      { label: "\u98CE\u5473" },
      { label: "\u5907\u6CE8" },
      { label: "\u8D2D\u5165\u65E5\u671F", field: "purchaseDate" },
      { label: "\u70D8\u7119\u65E5\u671F", field: "roastDate" },
      { label: "\u5F00\u888B\u65E5\u671F", field: "openedDate" },
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
    this.editableCell(tr, bean, "process", "text");
    this.editableCell(tr, bean, "variety", "text");
    this.editableCell(tr, bean, "roaster", "text");
    this.editableCell(tr, bean, "price", "number");
    this.editableCell(tr, bean, "totalWeight", "number");
    this.editableCell(tr, bean, "remaining", "number");
    const ppgCell = tr.createEl("td", { text: `\xA5${this.formatNumber(getPricePerGram(bean))}` });
    ppgCell.addClass("coffee-tracker-cell-readonly");
    this.ratingCell(tr, bean);
    this.editableCell(tr, bean, "flavor", "text");
    this.editableCell(tr, bean, "comment", "text");
    this.editableCell(tr, bean, "purchaseDate", "date");
    this.editableCell(tr, bean, "roastDate", "date");
    this.editableCell(tr, bean, "openedDate", "date");
    const actionCell = tr.createEl("td", { cls: "coffee-tracker-cell-actions" });
    const preset = bean.deductionPreset;
    const btn = actionCell.createEl("button", {
      cls: "coffee-tracker-btn coffee-tracker-btn-deduct-sm",
      text: `${preset.label} -${this.formatNumber(preset.amount)}g`
    });
    btn.addEventListener("click", async () => {
      const success = await this.plugin.dataManager.deduct(bean.id, preset);
      if (success) {
        new import_obsidian5.Notice(`${bean.name}: -${this.formatNumber(preset.amount)}g`);
        this.onRefresh();
      } else {
        new import_obsidian5.Notice("\u4F59\u91CF\u4E0D\u8DB3\uFF01");
      }
    });
    const historyBtn = actionCell.createEl("button", { cls: "coffee-tracker-btn-link", text: "\u5386\u53F2" });
    historyBtn.addEventListener("click", () => {
      const { HistoryModal: HistoryModal2 } = (init_HistoryModal(), __toCommonJS(HistoryModal_exports));
      new HistoryModal2(this.plugin.app, this.plugin, bean, () => this.onRefresh()).open();
    });
    if (!bean.archived && bean.remaining > 0) {
      const settleBtn = actionCell.createEl("button", {
        cls: "coffee-tracker-btn-link coffee-tracker-btn-settle",
        text: "\u5E73\u8D26\u5F52\u6863"
      });
      settleBtn.addEventListener("click", async () => {
        await this.settleBean(bean);
      });
    }
  }
  editableCell(tr, bean, field, inputType) {
    const value = bean[field];
    const displayText = this.formatCellValue(field, value);
    const td = tr.createEl("td", { text: displayText });
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
          td.textContent = displayText;
        }
      };
      input.addEventListener("blur", save);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") {
          td.empty();
          td.textContent = displayText;
        }
      });
    });
  }
  formatCellValue(field, value) {
    if (typeof value === "number" && this.shouldFormatField(field)) {
      return this.formatNumber(value);
    }
    return String(value != null ? value : "");
  }
  shouldFormatField(field) {
    return field === "price" || field === "totalWeight" || field === "remaining";
  }
  formatNumber(value) {
    return formatDisplayNumber(value, this.plugin.dataManager.data.settings.displayPrecision);
  }
  ratingCell(tr, bean) {
    const displayText = formatRatingDisplay(bean);
    const td = tr.createEl("td", { text: displayText });
    td.addClass("coffee-tracker-cell-editable");
    td.addEventListener("dblclick", () => {
      td.empty();
      const input = td.createEl("input", { type: "text" });
      input.value = displayText;
      input.addClass("coffee-tracker-cell-input");
      input.focus();
      input.select();
      const save = async () => {
        const rating = normalizeRatingInput(input.value, bean.ratingLabel || bean.rating);
        if (rating.label !== bean.ratingLabel || rating.value !== bean.rating) {
          await this.plugin.dataManager.updateBean(bean.id, {
            rating: rating.value,
            ratingLabel: rating.label
          });
          this.onRefresh();
        } else {
          td.empty();
          td.textContent = displayText;
        }
      };
      input.addEventListener("blur", save);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") {
          td.empty();
          td.textContent = displayText;
        }
      });
    });
  }
  async settleBean(bean) {
    const remaining = bean.remaining;
    const amountText = this.formatNumber(remaining);
    if (!window.confirm(`\u786E\u8BA4\u5C06\u300C${bean.name}\u300D\u4F59\u91CF ${amountText}g \u5E73\u8D26\u4E3A 0 \u5E76\u5F52\u6863\uFF1F`)) return;
    const success = await this.plugin.dataManager.settleBean(bean.id);
    if (success) {
      new import_obsidian5.Notice(`${bean.name}: \u5DF2\u5E73\u8D26\u5F52\u6863 ${amountText}g`);
      this.onRefresh();
    } else {
      new import_obsidian5.Notice("\u5E73\u8D26\u5F52\u6863\u5931\u8D25");
    }
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
init_types();
var CoffeeTrackerSettingTab = class extends import_obsidian8.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "\u5496\u5561\u8C46\u5E93\u5B58\u8BBE\u7F6E" });
    new import_obsidian8.Setting(containerEl).setName("\u6263\u51CF\u9884\u8BBE").setDesc("\u73B0\u5728\u6BCF\u4E2A\u8C46\u5B50\u5355\u72EC\u4FDD\u5B58\u4E00\u4E2A\u6263\u51CF\u9884\u8BBE\u3002\u53EF\u76F4\u63A5\u5728\u770B\u677F\u5361\u7247\u91CC\u4FEE\u6539\uFF0C\u4E5F\u53EF\u5728\u65B0\u589E/\u7F16\u8F91\u5F39\u7A97\u91CC\u8BBE\u7F6E\u3002");
    containerEl.createEl("h3", { text: "\u6570\u5B57\u663E\u793A" });
    new import_obsidian8.Setting(containerEl).setName("\u5C0F\u6570\u4F4D\u6570").setDesc("\u63A7\u5236\u91CD\u91CF\u3001\u6263\u51CF\u514B\u6570\u3001\u5386\u53F2\u7528\u91CF\u548C\u514B\u4EF7\u6700\u591A\u4FDD\u7559\u7684\u5C0F\u6570\u4F4D\u6570\u3002").addDropdown((drop) => {
      for (let precision = MIN_DISPLAY_PRECISION; precision <= MAX_DISPLAY_PRECISION; precision += 1) {
        drop.addOption(String(precision), `${precision} \u4F4D`);
      }
      drop.setValue(String(this.plugin.dataManager.data.settings.displayPrecision));
      drop.onChange(async (value) => {
        this.plugin.dataManager.data.settings.displayPrecision = normalizeDisplayPrecision(value);
        await this.plugin.dataManager.save();
        this.plugin.refreshViews();
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
  refreshViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_COFFEE)) {
      if (leaf.view instanceof CoffeeView) {
        leaf.view.refresh();
      }
    }
  }
  onunload() {
  }
};
