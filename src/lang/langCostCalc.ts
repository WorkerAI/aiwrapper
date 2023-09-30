import { langPricePerToken } from "../info.ts";

export const langConstCalc = (
  modelName: string,
  inTokens: number,
  outTokens: number,
): string => {
  let inPricePerToken = 0;
  let outPricePerToken = 0;

  if (langPricePerToken.has(modelName)) {
    [inPricePerToken, outPricePerToken] = langPricePerToken.get(
      modelName,
    ) as [number, number];
  } else {
    throw new Error(`Unknown model: ${modelName}`);
  }

  return (inTokens * inPricePerToken + outTokens * outPricePerToken).toFixed(
    10,
  );
};

export default langConstCalc;