# AIWrapper
A Universal AI Wrapper for JavaScript & TypeScript

Generate text, images, and voice from anywhere—servers, browsers and apps. AIWrapper works in anything that runs JavaScript.

## Features
- Generate text, images, and voice with a simple API
- Easily calculate cost of usage
- Output objects based on needed schemas from LLMs
- Swap models quickly or chain different models together
- Use it with JavaScript or TypeScript from anywhere

## Installation
Install with npm or import in Deno by URL.

### NPM
```bash
npm install aiwrapper
```

### Deno
```typescript
import * as aiwrapper from "https://deno.land/x/aiwrapper/mod.ts";
```

## Quick Start

### Generate Text
```javascript
import { Lang } from "aiwrapper";

const lang = Lang.openai({ apiKey: "YOUR KEY" });
const answer = await lang.ask("Say hi!");
console.log(answer);
```

### Generate Image
```javascript
import { Img } from "aiwrapper";

const img = Img.openai({ apiKey: "YOUR KEY" });
const image = await img.ask('A portrait of a cute cat');

console.log(image);
```

### Generate Voice
```javascript
import { Voice } from "aiwrapper";

const voice = Voice.google({ apiKey: "YOUR KEY" });
const audio = voice.ask('Hello, world!');

console.log(audio.length);
```
