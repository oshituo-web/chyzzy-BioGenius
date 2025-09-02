'use client';

import { PauseCircle, PlayCircle } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';
import { BotIcon } from './icons';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
  textForTts?: string;
}

export default function ChatMessage({ id, role, content, textForTts }: ChatMessageProps) {
  const { isPlaying, isPaused, speak, togglePlayPause, cancel } = useSpeech(textForTts || '', {
    onEnd: () => {},
  });
  const isAssistant = role === 'assistant';

  const handlePlay = () => {
    if (!textForTts) return;
    if (isPlaying || isPaused) {
      togglePlayPause();
    } else {
      speak();
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
        {isAssistant && textForTts && (
          <div className="mt-2 sm:mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlay}
              className="-ml-2 h-auto p-1 text-primary hover:bg-primary/10"
            >
              {isPlaying ? (
                <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="ml-1 sm:ml-2 text-xs font-medium">
                {isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play Audio'}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
