import { GoogleGenAI, Modality } from "@google/genai";
import { StoryConfig, VoicePreset } from "../types";

// Helper to encode ArrayBuffer to Base64 (for standard usage if needed, though we use raw PCM decoding)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to decode Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM audio data from Gemini
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateStory = async (config: StoryConfig): Promise<string> => {
  const ai = getClient();
  
  let prompt = `Write a creative and engaging story about "${config.topic}". `;
  prompt += `Genre: ${config.genre}. `;
  
  if (config.length === 'Short') prompt += "Keep it under 100 words. ";
  else if (config.length === 'Medium') prompt += "Keep it around 300 words. ";
  else prompt += "Keep it around 600 words. ";

  prompt += "Make it suitable for reading aloud with emotion.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "Failed to generate story.";
};

export const generateSpeech = async (
  text: string, 
  voicePreset: VoicePreset, 
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const ai = getClient();

  // Combine the style instruction with the text
  const textToSay = `${voicePreset.stylePrompt} ${text}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: textToSay }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voicePreset.geminiVoice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("No audio data received from Gemini.");
  }

  const rawBytes = base64ToUint8Array(base64Audio);
  
  // Gemini TTS usually outputs 24kHz PCM
  return await decodeAudioData(rawBytes, audioContext, 24000, 1);
};
