import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { fileURLToPath } from 'url';

console.log("Adding .js extension to build files because it's required for ES6 modules in node...");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const buildDir = path.join(__dirname, 'js_build');

const addJsExtensionToBuild = () => {
  const files = glob.sync(`${buildDir}/**/*.js`);
  files.forEach((filePath) => {
    //console.log(`### Processing file: ${filePath}`); // Debugging
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/from ['"](.+)['"]/g, (match, p1) => {
      //console.log(`Replacing: ${match}`); // Debugging
      //console.log(`With from "${p1}.js"`); // Debugging
      return `from "${p1}.js"`;
    });

    console.log(`## File: ${filePath}`); 
    console.log(content);

    fs.writeFileSync(filePath, content);
  });
};

//addJsExtensionToBuild();