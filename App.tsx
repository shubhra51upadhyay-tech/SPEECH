import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GENRES, VOICE_PRESETS } from './constants';
import { StoryConfig, VoicePreset } from './types';
import { generateStory, generateSpeech } from './services/geminiService';
import VoiceCard from './components/VoiceCard';
import AudioVisualizer from './components/AudioVisualizer';

// Icons
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
);

const App: React.FC = () => {
  // --- State ---
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [length, setLength] = useState<'Short' | 'Medium' | 'Long'>('Short');
  const [generatedText, setGeneratedText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoicePreset>(VOICE_PRESETS[0]);
  
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // --- Refs for Audio ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyserState, setAnalyserState] = useState<AnalyserNode | null>(null); // For React to re-render vis

  // --- Handlers ---

  const handleGenerateStory = async () => {
    if (!topic.trim()) return;
    setIsGeneratingStory(true);
    setGeneratedText(''); // clear previous
    try {
      const story = await generateStory({ topic, genre, length });
      setGeneratedText(story);
    } catch (error) {
      console.error(error);
      alert("Failed to generate story. Please try again.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleSpeak = async () => {
    if (!generatedText.trim()) return;

    // Stop current playback if any
    stopAudio();

    setIsSynthesizing(true);

    try {
      // Initialize Audio Context if not already
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Prepare analyser if missing
      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        setAnalyserState(analyser); // Trigger React update for Visualizer
      }

      // 1. Fetch Audio Buffer from Gemini (Service)
      const audioBuffer = await generateSpeech(generatedText, selectedVoice, ctx);

      // 2. Create Source Node
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // 3. Connect nodes: Source -> Analyser -> Destination
      source.connect(analyserRef.current!);
      analyserRef.current!.connect(ctx.destination);

      // 4. Handle end of playback
      source.onended = () => {
        setIsPlaying(false);
      };

      // 5. Start Playback
      source.start();
      audioSourceRef.current = source;
      setIsPlaying(true);

    } catch (error) {
      console.error("TTS Error:", error);
      alert("Failed to synthesize speech. Check your API key or try a shorter text.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) { /* ignore if already stopped */ }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white pb-20">
      
      {/* --- Header --- */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <SparklesIcon />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              VoxTale
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-medium px-3 py-1 rounded-full bg-brand-900/50 text-brand-300 border border-brand-500/20">
               Powered by Gemini 2.5
             </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- Left Column: Configuration --- */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Story Generator Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-brand-200">
              <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
              Create Story
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. A robot who loves gardening..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Length</label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="Short">Short (~100w)</option>
                    <option value="Medium">Medium (~300w)</option>
                    <option value="Long">Long (~600w)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateStory}
                disabled={isGeneratingStory || !topic}
                className={`w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                  ${isGeneratingStory 
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/20'
                  }`}
              >
                {isGeneratingStory ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Dreaming...
                  </>
                ) : (
                  <>
                    <SparklesIcon />
                    Generate Story
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Voice Selector */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-brand-200">
              <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
              Select Voice Persona
            </h2>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
              {VOICE_PRESETS.map(preset => (
                <VoiceCard
                  key={preset.id}
                  preset={preset}
                  isSelected={selectedVoice.id === preset.id}
                  onClick={() => setSelectedVoice(preset)}
                />
              ))}
            </div>
          </div>

        </section>

        {/* --- Right Column: Output & Player --- */}
        <section className="lg:col-span-8 space-y-6 flex flex-col h-full">
          
          {/* Text Area */}
          <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-brand-200">
                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                Story Board
              </h2>
              {generatedText && (
                <button 
                  onClick={() => { navigator.clipboard.writeText(generatedText); }}
                  className="text-xs text-slate-500 hover:text-brand-400 transition-colors"
                >
                  Copy Text
                </button>
              )}
            </div>
            
            <textarea
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              placeholder="Your generated story will appear here. You can also type or paste text manually..."
              className="flex-1 w-full bg-slate-950/50 border border-slate-800/50 rounded-xl p-6 text-slate-300 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-brand-500/50 font-serif text-lg custom-scrollbar transition-colors"
            />
          </div>

          {/* Audio Player Control */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl sticky bottom-4 z-40">
            <div className="flex flex-col md:flex-row items-center gap-6">
              
              {/* Controls */}
              <div className="flex flex-col items-center justify-center min-w-[120px]">
                {isPlaying ? (
                  <button
                    onClick={stopAudio}
                    className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center ring-1 ring-red-500/50"
                  >
                    <StopIcon />
                  </button>
                ) : (
                  <button
                    onClick={handleSpeak}
                    disabled={isSynthesizing || !generatedText}
                    className={`w-16 h-16 rounded-full transition-all flex items-center justify-center shadow-lg
                      ${isSynthesizing || !generatedText
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-brand-600 hover:bg-brand-500 text-white ring-4 ring-brand-500/20 hover:scale-105'
                      }
                    `}
                  >
                    {isSynthesizing ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <PlayIcon />
                    )}
                  </button>
                )}
                <div className="mt-2 text-xs font-medium text-slate-500">
                  {isSynthesizing ? 'Synthesizing...' : isPlaying ? 'Playing' : 'Listen'}
                </div>
              </div>

              {/* Visualizer Area */}
              <div className="flex-1 w-full relative">
                <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
                   <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Voice: {selectedVoice.name}</span>
                </div>
                <AudioVisualizer analyser={analyserState} isPlaying={isPlaying} />
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default App;
