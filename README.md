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
const result = await lang.ask("Say hi!");
console.log(result);
```

### Generate Image (Conming Soon)
```javascript
import { Img } from "aiwrapper";

const img = Img.openai({ apiKey: "YOUR KEY" });
const image = await img.ask('A portrait of a cute cat');

console.log(image);
```

### Generate Voice (Conming Soon)
```javascript
import { Speech } from "aiwrapper";

const speech = Speech.elevenlabs({ apiKey: "YOUR KEY" });
const audio = speech.ask('Hello, world!');

console.log(audio.length);
```

## Lang (LLM) Examples

### Initialize a Model
```javascript
import { Lang } from "aiwrapper";

const lang = Lang.openai({ apiKey: "YOUR KEY" }); // or Lang.anthropic
```

### Stream Results
```javascript
await lang.ask('Hello, AI!', streamingResult => {vs
  console.log(streamingResult.answer);
});
```

### Use Templates
```javascript
// In most cases - a prompt template should be just a function that returns a string
function getPrompt(product) {
  return `You are a naming consultant for new companies. What is a good name for a company that makes ${product}?     
Write just the name. Nothing else aside from the name - no extra comments or characters that are not part of the name.`;
}

const prompt = getPrompt("colorful socks");

await lang.ask(prompt, streamingResult => { 
  console.log(streamingResult.answer);
});
```

### Getting Objects from LLMs
```javascript
async function askForCompanyNames() {
  // We can ask for an object with a particular schema. In that case - an array with company names as strings.
  
  const product = "colorful socks";
  const numberOfNames = 3;
  
  const result = await lang.askForObject({
    instructions: [
      `You are a naming consultant for new companies. What is a good name for a company that makes ${product}?`,
      `Return ${numberOfNames} names.`
    ],
    objectExamples: [
      ["Name A", "Name B", "Name C"]
    ]
  }, streamingResult => { 
    console.log(streamingResult.answer);
  });
  
  return result.answerObj;
}

const names = await askForCompanyNames();
```

### Chaining Prompts
```javascript
async function askForStoriesBehindTheNames() {
  // We can use an answer in other prompts. Here we ask to come up with stores for all of the names we've got.
  const names = await askForCompanyNames();
  const stories = [];

  for (const name of names) {
    const story = await lang.askForObject({
      instructions: [
        `You are a professional writer and a storiteller.`,
        `Look at the name "${name}" carefully and reason step-by-step about the meaning of the name and what is the potential story behing it.`,
        `Write a short story. Don't include any comments or characters that are not part of the story.`,
      ],
      objectExamples: [
        {
          "name": "Name A",
          "reasoning": "Reasoning about Name A",
          "story": "Story about Name A"
        }
      ]
    }, streamingResult => { 
      console.log(streamingResult.answer);
    });

    stories.push(story);
  }

  return stories;
}

const namesWithStories = await askForStoriesBehindTheNames();
```

### Calculating costs
```javascript
// We can get the cost of using models from result.totalCost
const result = await lang.ask('Say a nice hello in about 200 characters');
console.log(result.totalCost);
```

