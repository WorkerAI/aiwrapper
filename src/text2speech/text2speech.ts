export abstract class TextToSpeech {
  static elevenlabs(options: ElevenLabsTextToSpeechOptions): ElevenLabsTextToSpeech {
    return new ElevenLabsTextToSpeech(options);
  }
}

type ElevenLabsTextToSpeechOptions = {
  apiKey: string;
  model?: string;
  voiceId?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
  };
}

type ElevenLabsTextToSpeechConfig = {
  apiKey: string;
  model: string;
  voiceId: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
  };
}

export class ElevenLabsTextToSpeech {
  _config: ElevenLabsTextToSpeechConfig;

  constructor(options: ElevenLabsTextToSpeechOptions) {
    this._config = {
      apiKey: options.apiKey,
      model: options.model || "eleven_monolingual_v1",
      voiceId: options.voiceId || "pNInz6obpgDQGcFmaJgB",
      voice_settings: options.voice_settings || {
        stability: 0.5,
        similarity_boost: 0.5
      },
    };
  }

  async ask(text: string): Promise<string> {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this._config.voiceId}`, {
      method: 'POST',
      headers: {
        'accept': 'audio/mpeg',
        'xi-api-key': this._config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "text": text,
        "model_id": this._config.model,
        "voice_settings": this._config.voice_settings
      }),
    });

    if (response.ok) {
      const data = await response.blob();
      const audioUrl = URL.createObjectURL(data);
      return audioUrl;
    } else {
      throw new Error("Failed to convert text to speech.");
    }
  }
}