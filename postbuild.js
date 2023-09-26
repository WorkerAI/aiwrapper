import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { fileURLToPath } from 'url';

console.log("Adding .js extension to build files because it's required for ES6 modules...");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const buildDir = path.join(__dirname, 'js_build');

const addJsExtensionToBuild = () => {
  const files = glob.sync(`${buildDir}/**/*.js`);
  files.forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/from ['"](.+)(?<!\.js)['"]/g, (match, p1) => {
      const importWithExtension = `from "${p1}.js"`;
      return importWithExtension;
    });

    fs.writeFileSync(filePath, content);
  });
};

addJsExtensionToBuild();

// TODO: delete node_source after build

console.log("🥳 JS build is read in ", buildDir);