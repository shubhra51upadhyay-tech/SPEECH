import { VoicePreset } from "./types";

export const GENRES = [
  "Fantasy", "Sci-Fi", "Mystery", "Romance", "Horror", "Adventure", "Fairy Tale", "Cyberpunk", "Comedy"
];

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'kore-warm',
    name: 'Storyteller',
    description: 'Warm, soothing, and narrative.',
    geminiVoice: 'Kore',
    stylePrompt: 'Read this in a warm, soothing storyteller voice:',
    iconColor: 'bg-amber-500'
  },
  {
    id: 'fenrir-deep',
    name: 'The Titan',
    description: 'Deep, resonant, and authoritative.',
    geminiVoice: 'Fenrir',
    stylePrompt: 'Read this in a deep, resonant, and serious tone:',
    iconColor: 'bg-slate-700'
  },
  {
    id: 'puck-energetic',
    name: 'The Spark',
    description: 'Energetic, playful, and fast.',
    geminiVoice: 'Puck',
    stylePrompt: 'Read this with high energy and excitement:',
    iconColor: 'bg-orange-500'
  },
  {
    id: 'charon-mysterious',
    name: 'The Oracle',
    description: 'Mysterious, low, and whispering.',
    geminiVoice: 'Charon',
    stylePrompt: 'Read this in a mysterious, whispering tone:',
    iconColor: 'bg-purple-800'
  },
  {
    id: 'zephyr-calm',
    name: 'Zen Master',
    description: 'Calm, balanced, and clear.',
    geminiVoice: 'Zephyr',
    stylePrompt: 'Read this in a very calm and meditative way:',
    iconColor: 'bg-teal-500'
  },
  {
    id: 'kore-sad',
    name: 'Melancholy',
    description: 'Emotional, sad, and slow.',
    geminiVoice: 'Kore',
    stylePrompt: 'Read this with a sad and emotional tone:',
    iconColor: 'bg-blue-400'
  },
  {
    id: 'fenrir-angry',
    name: 'Commander',
    description: 'Intense, loud, and commanding.',
    geminiVoice: 'Fenrir',
    stylePrompt: 'Read this in an angry and commanding shout:',
    iconColor: 'bg-red-600'
  },
  {
    id: 'puck-surprised',
    name: 'The Gasp',
    description: 'Shocked and surprised intonation.',
    geminiVoice: 'Puck',
    stylePrompt: 'Read this as if you are completely shocked and surprised:',
    iconColor: 'bg-pink-500'
  },
  {
    id: 'charon-scary',
    name: 'The Ghost',
    description: 'Creepy and unsettling.',
    geminiVoice: 'Charon',
    stylePrompt: 'Read this in a scary, haunting voice:',
    iconColor: 'bg-gray-800'
  },
  {
    id: 'zephyr-happy',
    name: 'Optimist',
    description: 'Bright, cheerful, and hopeful.',
    geminiVoice: 'Zephyr',
    stylePrompt: 'Read this in a very happy and cheerful voice:',
    iconColor: 'bg-yellow-400'
  },
];
