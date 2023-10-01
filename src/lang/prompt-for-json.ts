export type PromptForJSON = {
  title: string;
  description: string;
  instructions: string[];
  outputExamples: object[];
  content: {
    [key: string]: string;
  };
};

export function buildPromptForGettingJSON(prompt: PromptForJSON): string {
  const instructionsCount = prompt.instructions ? prompt.instructions.length : 0;
  const instructions = prompt.instructions
    ? "\n## Instructions\n" + prompt.instructions
      .map((instruction, idx) => `${idx + 1}. ${instruction}`)
      .join("\n")
    : "";

  const contentFields = Object.keys(prompt.content)
  .map((key) => `## ${key}\n${prompt.content[key]}`)
  .join("\n\n");

  let exampleOutputs = "";
  if (prompt.outputExamples && prompt.outputExamples.length > 0) {
    exampleOutputs = `## Examples of Output\n${
      prompt.outputExamples
        .map((example) => JSON.stringify(example, null, 2))
        .join("\n\n")
    }`;
  }

  return `# ${prompt.title}
${prompt.description}
${instructions}
${
    instructionsCount + 1
  }. Output: Provide a correctly formatted JSON object (using Examples of Output) as your output in the Output section, in accordance with ECMA-404 standards. Make sure there are no comments or extraneous text.

${contentFields}

${exampleOutputs}

## Output (JSON as ECMA-404)
\`\`\`json`;
}

/*
export class PromptForJSON {
  readonly title: string;
  readonly description: string;
  readonly instructions: string[];
  readonly outputExamples: object[];

  constructor(config: PromptForJSON) {
    this.title = config.title;
    this.description = config.description;
    this.instructions = config.instructions;
    this.outputExamples = config.outputExamples;
  }

  getTextPrompt(content: StringFieldsOnly): string {
    const instructionsCount = this.instructions ? this.instructions.length : 0;
    const instructions = this.instructions
      ? "\n## Instructions\n" + this.instructions
        .map((instruction, idx) => `${idx + 1}. ${instruction}`)
        .join("\n")
      : "";

    const contentFields = Object.keys(content)
      .map((key) => `## ${key}\n${content[key]}`)
      .join("\n\n");

    let exampleOutputs = "";
    if (this.outputExamples && this.outputExamples.length > 0) {
      // @TODO: add back-tics with 'json':  \`\`\`json
      // @TODO: parse field_optional property and weed it out from JSON
      // @TODO: instruct LLM that all _optional fields are indeed optional
      exampleOutputs = `## Examples of Output\n${
        this.outputExamples
          .map((example) => JSON.stringify(example, null, 2))
          .join("\n\n")
      }`;
      
    }

    return `# ${this.title}
${this.description}
${instructions}
${
      instructionsCount + 1
    }. Output: Provide a correctly formatted JSON object (using Examples of Output) as your output in the Output section, in accordance with ECMA-404 standards. Make sure there are no comments or extraneous text.

${contentFields}

${exampleOutputs}

## Output (JSON as ECMA-404)
\`\`\`json`;
  }
}

type StringFieldsOnly = {
  [key: string]: string;
};
*/