import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { fileURLToPath } from 'url';

console.log("Preparing files for node source without .ts extensions...");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const srcDir = path.join(__dirname, 'src');
const destDir = path.join(__dirname, 'temp_node_source');

const processFiles = (filePattern) => {
  glob.sync(filePattern).forEach((filePath) => {
    const destPath = path.join(destDir, path.relative(srcDir, filePath));
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(filePath, destPath);
  });

  glob.sync(filePattern.replace(srcDir, destDir)).forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/from ['"](.+)\.ts['"]/g, 'from "$1"');
    fs.writeFileSync(filePath, content);
  });
};

processFiles(`${srcDir}/**/*.ts`);
processFiles(`${srcDir}/**/*.js`);