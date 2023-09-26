import { Lang } from "./mod.ts";

const lang = Lang.openai({
  apiKey: "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",
});

const answer = await lang.ask("Write a nice hello letter to Dmitry Kury in 100 tokens", (tokens: LangTokensFlow) => {
  console.log(tokens.answer);

  // TODO: implement tokens.abort()
  if (tokens.finished) {
    console.log("Done!");
    console.log(tokens);
  }
});