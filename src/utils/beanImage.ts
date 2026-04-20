import { App, Notice, Setting, TextComponent, normalizePath } from 'obsidian';

const IMAGE_FOLDER = 'Coffee Bean Tracker/Images';

function sanitizeFileNamePart(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|#^\[\]]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || 'coffee-bean';
}

function getImageExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/heic':
      return 'heic';
    case 'image/heif':
      return 'heif';
    default:
      return 'png';
  }
}

async function ensureFolder(app: App, folderPath: string): Promise<void> {
  const normalizedFolder = normalizePath(folderPath);
  const parts = normalizedFolder.split('/');
  let currentPath = '';

  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    const existing = app.vault.getAbstractFileByPath(currentPath);
    if (!existing) {
      await app.vault.createFolder(currentPath);
    }
  }
}

export async function saveImageBlobToVault(
  app: App,
  blob: Blob,
  preferredName?: string
): Promise<string> {
  await ensureFolder(app, IMAGE_FOLDER);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = Math.random().toString(36).slice(2, 7);
  const safeName = sanitizeFileNamePart(preferredName || '');
  const extension = getImageExtension(blob.type);
  const filePath = normalizePath(
    `${IMAGE_FOLDER}/${safeName}-${timestamp}-${randomSuffix}.${extension}`
  );

  const buffer = await blob.arrayBuffer();
  await app.vault.createBinary(filePath, buffer);
  return filePath;
}

function resolveImageSrc(app: App, imagePath: string): string {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }
  return app.vault.adapter.getResourcePath(normalizePath(imagePath));
}

async function extractImageFromClipboard(
  evt: ClipboardEvent
): Promise<File | null> {
  const items = Array.from(evt.clipboardData?.items || []);
  const imageItem = items.find((item) => item.type.startsWith('image/'));
  return imageItem?.getAsFile() || null;
}

interface BeanImageFieldOptions {
  containerEl: HTMLElement;
  app: App;
  value: string;
  onChange: (value: string) => void;
  getSuggestedName?: () => string;
}

export function renderBeanImageField(options: BeanImageFieldOptions): void {
  const { containerEl, app, onChange, getSuggestedName } = options;
  let currentValue = options.value || '';
  let pathInput: TextComponent | null = null;
  let isSaving = false;

  const imageSetting = new Setting(containerEl)
    .setName('图片')
    .setDesc('支持手填路径，也支持在下方区域点击后直接粘贴剪贴板图片');

  imageSetting.addText((text) => {
    pathInput = text;
    text.setPlaceholder('vault 路径或 URL');
    text.setValue(currentValue);
    text.onChange((value) => {
      currentValue = value.trim();
      onChange(currentValue);
      renderPreview();
      updateButtons();
    });
    text.inputEl.addEventListener('paste', async (evt: ClipboardEvent) => {
      const imageFile = await extractImageFromClipboard(evt);
      if (!imageFile) return;
      evt.preventDefault();
      await saveClipboardImage(imageFile);
    });
  });

  const imageField = containerEl.createDiv({ cls: 'coffee-tracker-image-field' });
  const preview = imageField.createDiv({ cls: 'coffee-tracker-image-preview' });

  const updateValue = (value: string) => {
    currentValue = value.trim();
    onChange(currentValue);
    if (pathInput && pathInput.getValue() !== currentValue) {
      pathInput.setValue(currentValue);
    }
    renderPreview();
    updateButtons();
  };

  const updateButtons = () => {
    if (pathInput?.inputEl) {
      pathInput.inputEl.disabled = isSaving;
    }
  };

  const renderPreview = () => {
    preview.empty();

    if (!currentValue) {
      preview.addClass('is-empty');
      preview.createDiv({
        cls: 'coffee-tracker-image-placeholder',
        text: '还没有图片',
      });
      return;
    }

    preview.removeClass('is-empty');
    const img = preview.createEl('img', {
      cls: 'coffee-tracker-image-preview-img',
    });
    img.src = resolveImageSrc(app, currentValue);
    img.alt = '咖啡豆图片预览';
    img.onerror = () => {
      preview.empty();
      preview.addClass('is-empty');
      preview.createDiv({
        cls: 'coffee-tracker-image-placeholder',
        text: '图片路径无效，已保留原值',
      });
    };

    preview.createDiv({
      cls: 'coffee-tracker-image-path',
      text: currentValue,
    });
  };

  const saveClipboardImage = async (imageFile: Blob) => {
    if (isSaving) return;
    isSaving = true;
    updateButtons();
    try {
      const savedPath = await saveImageBlobToVault(
        app,
        imageFile,
        getSuggestedName?.()
      );
      updateValue(savedPath);
      new Notice(`图片已保存到 ${savedPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存图片失败';
      new Notice(message);
    } finally {
      isSaving = false;
      updateButtons();
    }
  };

  renderPreview();
  updateButtons();
}
