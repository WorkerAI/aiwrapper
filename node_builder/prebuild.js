import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/*
The build files live in a directory that is one level down from the root.
.
├── root
│   ├── node_builder
│   │   └── prebuild.js
│   └── tsconfig.json
*/
const repoRootDir = path.resolve(__dirname, '..');
const tsconfig = JSON.parse(fs.readFileSync(path.resolve(repoRootDir, 'tsconfig.json'), 'utf8'));
const srcDir = path.join(repoRootDir, 'src');
const outDir = path.join(repoRootDir, tsconfig.compilerOptions.rootDir);

const copyFilesFromDir = (filePattern) => {
  // Copy files from actual source to a build folder.
  glob.sync(filePattern).forEach((filePath) => {
    const destPath = path.join(outDir, path.relative(srcDir, filePath));
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(filePath, destPath);
  });
};

const removeTsExtensions = (filePattern) => {
  glob.sync(filePattern.replace(srcDir, outDir)).forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/from ['"](.+)\.ts['"]/g, 'from "$1"');
    fs.writeFileSync(filePath, content);
  });
};

const cleanOutDir = async () => {
  try {
    await fs.promises.access(outDir);
    await fs.promises.rm(outDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const prebuild = async () => {
  console.log("PREBUILD. Preparing files for node source without .ts extensions...");
  console.log("1. Removing files from ", outDir);
  await cleanOutDir();
  console.log("2. Copying files from ", srcDir, " to ", outDir, " and removing .ts extensions.")
  copyFilesFromDir(`${srcDir}/**/*.{js,ts}`);
  console.log("3. Removing .ts extensions from files in ", outDir);
  removeTsExtensions(`${outDir}/**/*.{js,ts}`);
  console.log("✅ PRE-BUILD");
};

(async () => {
  await prebuild();
})();

