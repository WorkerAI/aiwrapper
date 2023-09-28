import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const tsconfig = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'tsconfig.json'), 'utf8'));
const srcDir = path.join(rootDir, tsconfig.compilerOptions.outDir);

const addJsExtensionToBuild = () => {
  const files = glob.sync(`${srcDir}/**/*.js`);
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

const postbuild = async () => {
  console.log("FINAL STEPS. Adding .js extension to build files because it's required for ES6 modules...");
  addJsExtensionToBuild();
  // @TODO: Remove the temp build folder.
  //console.log("Removing the temp build folder...");

  console.log("🥳 🎉 🍾  JavaScript build is ready to use from: ", srcDir);
};

(async () => {
  await postbuild();
})();