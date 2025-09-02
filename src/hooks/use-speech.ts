'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type SpeechOptions = {
  onEnd?: () => void;
};

export const useSpeech = (text: string, options: SpeechOptions = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';

    u.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    u.onpause = () => {
      setIsPlaying(false);
      setIsPaused(true);
    };

    u.onresume = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    u.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      options.onEnd?.();
    };

    utteranceRef.current = u;

    return () => {
      synth.cancel();
    };
  }, [text, options.onEnd]);

  const speak = useCallback(() => {
    const synth = window.speechSynthesis;
    if (utteranceRef.current) {
      if (synth.speaking) {
        synth.cancel(); // Stop any current speech before starting a new one
      }
      synth.speak(utteranceRef.current);
    }
  }, []);

  const cancel = useCallback(() => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      synth.pause();
    } else if (synth.paused) {
      synth.resume();
    } else {
      speak();
    }
  }, [speak]);

  return { isPlaying, isPaused, speak, cancel, togglePlayPause };
};
