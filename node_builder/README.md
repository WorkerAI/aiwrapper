# Building an NPM package

### What does NPM package use as a source?
We take ./src which are mostly TypeScript files and compile them into JavaScript, so any JS runtime can run our package.

## How building works
When we run "npm run build", 3 scipts execute: 
1. ./node_builder/prebuild.js
2. tsc (to process TypeScript)
3. ./node_builder/postbuild.js

#### What is the logic there?
1. Copy JS/TS files from ./src to ./temp_node_source
2. Remove .ts extensions from imports (import ./index.ts -> import ./index)
3. Compile TS to JS
4. Add .js to every import 🙈
5. Remove ./temp_node_source

### Why do we import files with .ts in ./src?
Becase we use Deno to develop this package and Deno requires .ts in imports.

### Why Deno?
It's nice and easier to run than NodeJS.
We can also use ./src directly in Deno in a production when developing app with Deno. No build step is required.