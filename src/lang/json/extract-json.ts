import jsonic from "./jsonic.js";

/**
 * Matching "{}" and its content in a string, text outside of {} will be ignored.
 * Just in case if we get backticks (Markdown's way of denoting code blocks) in the answer or other text.
 */
const regexForJson = /{.*}/s;

/**
 * Tries to extract JSON from a string.
 * Uses a strict JSON parser first, if it fails, tries to use "jsonic" which allows for more relaxed JSON syntax.
 * @param str JSON along with other text
 * @returns returns an object or null if failed to extract.
 */
export default function extractJSON(
  str: string,
  verbose = false,
): unknown | null {
  const jsonMatch = regexForJson.exec(str);

  if (jsonMatch === null) {
    if (verbose) {
      console.error("The string is not JSON: " + str);
    }
    return null;
  }

  const possilbeJsonStr = jsonMatch[0];
  let jsonObj;

  try {
    jsonObj = JSON.parse(possilbeJsonStr);
  } catch {
    if (verbose) {
      console.error("Failed to parse JSON");
      console.log(possilbeJsonStr);
      console.log(
        "Will try to parse it with a less strict JSON parser (jsonic)",
      );
    }

    try {
      jsonObj = jsonic(possilbeJsonStr);
    } catch {
      if (verbose) {
        console.error("Failed to parse JSON with jsonic as well.");
      }
      jsonObj = null;
    }
  }

  return jsonObj;
}