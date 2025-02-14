// @TODO: change to use schema instead of objectExamples

// Consider: instructions, schema, objects, examples (?)

export type PromptForObject = {
  // @TODO: make title and description optional
  title?: string;
  description?: string;
  instructions: string[];
  objectExamples: object[];
  content?: {
    [key: string]: string;
  };
};

export function buildPromptForGettingJSON(prompt: PromptForObject): string {
  const instructionsCount = prompt.instructions
    ? prompt.instructions.length
    : 0;
  const instructions = prompt.instructions
    ? "\n## Instructions\n" + prompt.instructions
      .map((instruction, idx) => `${idx + 1}. ${instruction}`)
      .join("\n")
    : "";

  let contentFields = prompt.content ? prompt.content : "";

  if (prompt.content) {
    contentFields = Object.keys(prompt.content)
      .map((key) => `## ${key}\n${prompt.content ? prompt.content[key] : ""}`)
      .join("\n\n");
  }

  let exampleOutputs = "";
  if (prompt.objectExamples && prompt.objectExamples.length > 0) {
    exampleOutputs = `## Examples of Output\n${
      prompt.objectExamples
        .map((example) => JSON.stringify(example, null, 2))
        .join("\n\n")
    }`;
  }

  return `# ${prompt.title ? prompt.title : "Prompt for JSON"}
${prompt.description ? prompt.description : ""}
${instructions}
${
    instructionsCount + 1
  }. Output: Provide a correctly formatted JSON object (using Examples of Output) as your output in the Output section, in accordance with ECMA-404 standards. Make sure there are no comments or extraneous text.

${contentFields}

${exampleOutputs}

## Output (JSON as ECMA-404)
\`\`\`json`;
}
