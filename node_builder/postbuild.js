import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { fileURLToPath } from 'url';

console.log("Adding .js extension to build files because it's required for ES6 modules...");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tsconfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'tsconfig.json'), 'utf8'));
const tempSrcDir = path.resolve(__dirname, tsconfig.compilerOptions.rootDir);
const buildDir = path.join(__dirname, tsconfig.compilerOptions.outDir);

const addJsExtensionToBuild = () => {
  const files = glob.sync(`${buildDir}/**/*.js`);
  files.forEach((filePath) => {
    // Skip if the file is the entry for NPM package.
    // We don't need to mess with it.
    if (path.basename(filePath) === 'nodeEntry.js') {
      return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/from ['"](.+)(?<!\.js)['"]/g, (match, p1) => {
      const importWithExtension = `from "${p1}.js"`;
      return importWithExtension;
    });

    fs.writeFileSync(filePath, content);
  });
};

addJsExtensionToBuild();

const projectRootDir = path.resolve(__dirname);

// Check if tempSrcDir is a subdirectory of our project's root directory.
if (tempSrcDir.startsWith(projectRootDir)) {
  // We delete the temporary sources directory.
  fs.rmdirSync(tempSrcDir, { recursive: true });
} else {
  console.error('Attempted to delete a directory outside the project. Operation aborted.');
}

console.log("🥳 JS build is read in ", buildDir);