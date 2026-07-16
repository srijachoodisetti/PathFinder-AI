import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { ClayCard, ClayButton } from '../ui';

interface VoiceTutorControllerProps {
  onSpeechTranscribed: (text: string) => void;
  lastTutorResponse?: string;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

export const VoiceTutorController: React.FC<VoiceTutorControllerProps> = ({
  onSpeechTranscribed,
  lastTutorResponse,
  voiceActive,
  setVoiceActive,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onstart = () => {
        setIsListening(true);
      };

      recog.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        onSpeechTranscribed(resultText);
        setIsListening(false);
      };

      recog.onerror = () => {
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    } else {
      setVoiceAvailable(false);
    }
  }, [onSpeechTranscribed]);

  const toggleListening = () => {
    if (!recognition) {
      // Browser doesn't support Web Speech. Let's do a beautiful simulation!
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        onSpeechTranscribed("What is solar energy and why is it sustainable?");
      }, 1500);
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleReadAloud = () => {
    if (!lastTutorResponse) return;
    
    // Stop any active speech first
    window.speechSynthesis.cancel();
    
    // Create utterance
    const cleanText = lastTutorResponse.replace(/[*#$]/g, ''); // Strip markdown highlights
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // If browser supports voice selection, try to find an English or regional voice
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.includes('en') || v.lang.includes('hi'));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
  };

  return (
    <ClayCard className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-100 rounded-3xl">
      <div className="flex items-center justify-between">
        <h5 className="font-bold text-xs text-text/80 flex items-center gap-1.5 uppercase tracking-wide">
          <Volume2 size={16} className="text-secondary animate-pulse" />
          Voice Interaction
        </h5>
        
        <button
          onClick={() => setVoiceActive(!voiceActive)}
          className={`p-1.5 rounded-lg border transition-all ${voiceActive ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-white border-slate-200 text-text/40'}`}
          title="Toggle automatic speech synthesis"
        >
          {voiceActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <ClayButton
          onClick={toggleListening}
          variant={isListening ? 'danger' : 'accent'}
          className={`flex-1 flex items-center justify-center gap-2 !py-2.5 rounded-2xl ${isListening ? 'animate-pulse' : ''}`}
        >
          <Mic size={16} />
          <span className="text-xs font-bold">{isListening ? 'Listening...' : 'Speak Question'}</span>
        </ClayButton>

        {lastTutorResponse && (
          <div className="flex gap-1.5">
            <ClayButton
              onClick={handleReadAloud}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-center"
              title="Read aloud response"
            >
              <Volume2 size={16} className="text-primary" />
            </ClayButton>
            <ClayButton
              onClick={handleStopSpeech}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-center"
              title="Stop voice output"
            >
              <VolumeX size={16} className="text-text/40" />
            </ClayButton>
          </div>
        )}
      </div>

      {!voiceAvailable && (
        <p className="text-[10px] text-warning font-semibold flex items-center gap-1">
          <AlertCircle size={12} />
          <span>Speech Recognition simulated in this browser</span>
        </p>
      )}
    </ClayCard>
  );
};
