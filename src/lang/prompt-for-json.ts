export type PromptForJSON = {
  // @TODO: make title and description optional
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