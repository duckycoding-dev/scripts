import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

// Helper function to create files
export const createFile = (filePath: string, content: string = '') => {
  writeFileSync(path.join(rootDir, filePath), content, { flag: 'wx' });
};

// Helper function to create directories
export const createDir = (dirPath: string) => {
  mkdirSync(path.join(rootDir, dirPath), { recursive: true });
};
