'use client';

import { PauseCircle, PlayCircle, LoaderCircle } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BotIcon } from './icons';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
  audioData?: string;
  audioAutoPlay?: boolean;
}

export default function ChatMessage({ id, role, content, audioData, audioAutoPlay }: ChatMessageProps) {
  const isAssistant = role === 'assistant';
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  useEffect(() => {
    if (isAssistant && !audioData) {
      setIsAudioLoading(true);
    } else {
      setIsAudioLoading(false);
    }
  }, [isAssistant, audioData]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audioData && audioAutoPlay) {
      audio.play().catch(e => console.error("Autoplay failed", e));
    }
  }, [audioData, audioAutoPlay]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsPaused(true);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, audioData]); // Rerun when audioData is available


  const handlePlayToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return (
    <div className={cn('flex items-start gap-3 sm:gap-4', isAssistant ? 'justify-start' : 'justify-end')}>
      {isAssistant && (
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-primary/50">
          <AvatarFallback className="bg-primary/20">
            <BotIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-sm shadow-sm',
          isAssistant
            ? 'bg-muted/50 rounded-tl-none'
            : 'bg-primary text-primary-foreground rounded-tr-none'
        )}
      >
        {content}
        {isAssistant && (
          <div className="mt-2 sm:mt-3">
             {audioData && <audio ref={audioRef} src={audioData} className="hidden" preload="auto" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayToggle}
              disabled={!audioData}
              className="-ml-2 h-auto p-1 text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              {isAudioLoading ? (
                 <LoaderCircle className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : isPlaying ? (
                <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="ml-1 sm:ml-2 text-xs font-medium">
                {isAudioLoading ? 'Loading Audio...' : isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play Audio'}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
