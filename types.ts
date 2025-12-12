export interface StoryConfig {
  topic: string;
  genre: string;
  length: 'Short' | 'Medium' | 'Long';
}

export type GeminiVoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface VoicePreset {
  id: string;
  name: string;
  description: string;
  geminiVoice: GeminiVoiceName;
  stylePrompt: string; // Instructions to the model (e.g., "Say happily: ")
  iconColor: string;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  audioBuffer: AudioBuffer | null;
  duration: number;
  currentTime: number;
}
