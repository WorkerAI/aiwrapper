# Building NPM package

## How building works

When we run "npm run build", 3 scipts execute: 
1. ./node_builder/prebuild.js
2. tsc (to process TypeScript)
3. ./node_builder/postbuild.js

### What is the logic there?

1. Copy JS/TS files from ./src to ./temp_node_source
2. Remove .ts extensions from imports (import ./index.ts -> import ./index)
3. Compile TS to JS
4. Add .js to every import 🙈
5. Remove ./temp_node_source