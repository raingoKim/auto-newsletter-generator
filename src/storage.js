import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StorageManager {
  constructor() {
    this.obsidianBasePath = 'C:\\Users\\raingo02\\Documents\\Obsidian Vault\\eBookMaking';
    this.localBasePath = path.join(__dirname, '..', 'News Completion');
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  sanitizeFileName(name) {
    return name.replace(/[<>:"/\\|?*]/g, '-').trim();
  }

  async saveToLocal(fileName, htmlContent, markdownContent) {
    await this.ensureDirectory(this.localBasePath);

    const sanitizedName = this.sanitizeFileName(fileName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    const htmlFileName = `${sanitizedName}_${timestamp}.html`;
    const mdFileName = `${sanitizedName}_${timestamp}.md`;

    const htmlPath = path.join(this.localBasePath, htmlFileName);
    const mdPath = path.join(this.localBasePath, mdFileName);

    await fs.writeFile(htmlPath, htmlContent, 'utf-8');
    await fs.writeFile(mdPath, markdownContent, 'utf-8');

    console.log(`\n✅ 로컬 저장 완료:`);
    console.log(`   HTML: ${htmlPath}`);
    console.log(`   MD: ${mdPath}`);

    return { htmlPath, mdPath };
  }

  async saveToObsidian(folderName, fileName, markdownContent) {
    const obsidianFolderPath = path.join(this.obsidianBasePath, folderName);
    await this.ensureDirectory(obsidianFolderPath);

    const sanitizedName = this.sanitizeFileName(fileName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const mdFileName = `${sanitizedName}_${timestamp}.md`;

    const mdPath = path.join(obsidianFolderPath, mdFileName);
    await fs.writeFile(mdPath, markdownContent, 'utf-8');

    console.log(`\n✅ 옵시디언 저장 완료:`);
    console.log(`   경로: ${mdPath}`);

    return mdPath;
  }
}
