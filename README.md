# AIWrapper

[AIWrapper](https://aiwrapper.org) is a neat AI wrapper for JavaScript & TypeScript

Generate text, images, and voice across platforms - browser and servers. NodeJS, Deno, Bun, React, Svelte, and more. It's framework independent.

## Features
- Simple and intuitive API
- Supports text, image, and voice generation
- Cross-platform: Use it with JavaScript or TypeScript in various environments

## Installation

### NPM
```bash
npm install aiwrapper
```

### Yarn
```bash
yarn add aiwrapper
```

### Deno
```typescript
import * as aiwrapper from "https://deno.land/x/aiwrapper";
```

## Quick Start

### Generate Text
```javascript
import { Lang } from "aiwrapper";

const lang = Lang.openai({ apiKey });
const answer = await lang.ask("Say hi!");
console.log(answer);
```

### Generate Image
```javascript
import { Img } from "aiwrapper";

const img = Img.openai({ apiKey });
const image = await img.ask('A portrait of a cute cat');

console.log(image);
```

### Generate Voice
```javascript
import { Voice } from "aiwrapper";

const voice = Voice.openai({ apiKey });
const audio = voice.ask('Hello, world!');

console.log(audio.length);
```
