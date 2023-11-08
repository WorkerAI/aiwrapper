import { Tokenizer, encodeBpe, decodeBpe } from '../tokenizer.ts';
import { tokensBase64 } from './encoding-cl100k_base.js';

const decodingBase64Arr = tokensBase64.split(' ');
const encodingBase64Map: Map<string, number> = new Map();
for (let i = 0; i < decodingBase64Arr.length; i++) {
  encodingBase64Map.set(decodingBase64Arr[i], i);
}

export class Tokenizer_cl100k_base implements Tokenizer {
  name = 'cl100k_base';

  encode(text: string): number[] {
    // @TODO: replace with a legit BPE encoder after an optimization
    const tokensPerWords = 1.43;
    const words = text.split(" "); 
    const encodedWords = new Array(Math.floor(words.length * tokensPerWords)).fill(0);
    return encodedWords;
    
    //return encodeBpe(text, encodingBase64Map);
  }

  decode(tokens: number[]): string {
    return decodeBpe(tokens, decodingBase64Arr);
  }
}

/*
console.log("TEST OpenAI Tokenizer");

const text = `{
  "name": "Become a millionaire in 3 years through a business",
  "description": "Your objective is to raise $1,000,000 in 3 years by starting a business. You have $10,000 of capital to start and can live without income for 18 months. As a software developer and a digital nomad, we can utilize these skills and lifestyle to our advantage.",
  "tasks": [
    {
      "name": "Identify profitable business ideas",
      "description": "Consider business ideas that can provide rapid growth and significant profit in a short period of time. As a software developer and digital nomad, online-based businesses may be best suited.",
      "tasks": [
        {
          "name": "Research successful online businesses",
          "description": "This step involves studying businesses that have quickly grown to become profitable, particularly in the online space.",
          "tasks": []
        },
        {
          "name": "Identify potential niches",
          "description": "Identify under-served markets within these business models, particularly ones which you could apply your software development skills.",
          "tasks": []
        }
      ]
    },
    {
      "name": "Create a business plan",
      "description": "Develop a business plan that details your business idea, strategy for growth, and financial projections.",
      "tasks": []
    },
    {
      "name": "Launching the Business",
      "description": "With the business plan in place, commence with the operations of the business.",
      "tasks": [
        {
          "name": "Setting up the business",
          "description": "Includes the tasks necessary to setup the business such as registering the business, setting up a website, etc.",
          "tasks": []
        },
        {
          "name": "Develop product or service",
          "description": "Develop the product or service which your business will be offering. As a software developer, this could involve coding a software or creating a digital platform.",
          "tasks": []
        },
        {
          "name": "Marketing and advertising campaign",
          "description": "Spread the word about your new business. Utilize both paid and organic marketing strategies.",
          "tasks": []
        }
      ]
    },
    {
      "name": "Generate Revenue",
      "description": "Revenue generation from the business operations to reach the target of $1,000,000",
      "tasks": [
        {
          "name": "Build and retain customer base",
          "description": "The revenue generation process will involve both attracting new customers and retaining existing ones.",
          "tasks": []
        },
        {
          "name": "Continuous Growth",
          "description": "Continue refining the product/service and marketing strategy to increase profits and scale the business, ensuring a steady growth towards the $1,000,000 target.",
          "tasks": []
        }
      ]
    }
  ]
}`;

console.log("String length:", text.length);

const tokenizer = new Tokenizer_cl100k_base();

const start = performance.now();
const tokens = tokenizer.encode(text);
const end = performance.now();
console.log("Tokenization time:", end - start, "ms");

console.log("Tokens:", tokens);
*/
