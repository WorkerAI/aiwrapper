import {
  httpRequestWithRetry as fetch,
} from "../http-request.ts";

/**
 * Speech2Text is a factory class for using speech to text models from different providers. 
 */
export abstract class Speech2Text {
  static openai(options: OpenAISpeech2TextOptions): OpenAISpeech2Text {
    return new OpenAISpeech2Text(options);
  }
}

type OpenAISpeech2TextOptions = {
  apiKey: string;
  model?: string;
}

type OpenAISpeech2TextConfig = {
  apiKey: string;
  model: string;
}

export class OpenAISpeech2Text {
  _config: OpenAISpeech2TextConfig;

  constructor(options: OpenAISpeech2TextOptions) {
    this._config = {
      apiKey: options.apiKey,
      model: options.model || "whisper-1",
    };
  }

  async ask(file: any): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', this._config.model);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this._config.apiKey,
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      return data.text;
    } else {
      throw new Error("Failed to convert speech to text.");
    }
  }
}