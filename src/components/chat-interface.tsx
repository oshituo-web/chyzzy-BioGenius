'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LoaderCircle, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import { nanoid } from 'nanoid';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { answerFollowUpAction, generateSpeechAction, identifyOrganismAction } from '@/app/actions';
import type { IdentifyOrganismFromImageOutput } from '@/ai/flows/identify-organism-from-image';
import { BotIcon } from '@/components/icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import ChatMessage from './chat-message';
import ImageUploadForm from './image-upload-form';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
  audioData?: string;
};

const followUpSchema = z.object({
  question: z.string().min(1, 'Please enter a question.'),
});

const initialMessages: Message[] = [
  {
    id: 'initial',
    role: 'assistant',
    content: (
      <div className="space-y-2">
        <p>Welcome to BioGenius Pro!</p>
        <p>Upload an image of a plant, animal, or insect, and I'll identify it for you.</p>
      </div>
    ),
  },
];

export default function ChatInterface() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrganism, setCurrentOrganism] = useState<IdentifyOrganismFromImageOutput | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof followUpSchema>>({
    resolver: zodResolver(followUpSchema),
    defaultValues: { question: '' },
  });

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  const handleReset = useCallback(() => {
    setMessages(initialMessages);
    setCurrentOrganism(null);
    form.reset();
    setIsLoading(false);
  }, [form]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  const handleImageUpload = async (file: File, enhancedPhotoDataUri: string, region?: string) => {
    setIsLoading(true);
    
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: (
        <div className='flex flex-col gap-2'>
          <Image
            src={enhancedPhotoDataUri}
            alt="Uploaded organism"
            width={200}
            height={200}
            className="rounded-lg"
          />
          {region && <p className='text-sm'>Region: {region}</p>}
        </div>
      ),
    };
    setMessages((prev) => [...prev, userMessage]);

    const { data, error } = await identifyOrganismAction({ photoDataUri: enhancedPhotoDataUri, region });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Identification Failed',
        description: error,
      });
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: <p>I couldn&apos;t identify the organism. Please try another image.</p>,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
      return;
    }

    if (data) {
      setCurrentOrganism(data);
      const textForTts = `I've identified this as a ${data.commonName}. Scientific name: ${
        data.scientificName
      }. Key features include: ${data.keyFeatures.join(', ')}. Some interesting facts are: ${data.interestingFacts.join(
        ', '
      )}.`;

      const assistantMessageId = nanoid();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: (
          <Card className="max-w-md bg-transparent border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">{data.commonName}</CardTitle>
              <CardDescription className="italic">{data.scientificName}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full" defaultValue="features">
                <AccordionItem value="features">
                  <AccordionTrigger>Key Features</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-1 pl-4">
                      {data.keyFeatures.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="facts">
                  <AccordionTrigger>Interesting Facts</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-1 pl-4">
                      {data.interestingFacts.map((fact, i) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                You can now ask me follow-up questions about the {data.commonName}.
              </p>
            </CardFooter>
          </Card>
        ),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      // Generate speech after displaying the content
      const speechResult = await generateSpeechAction({ text: textForTts });
      if (speechResult.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, audioData: speechResult.data.audio } : msg
          )
        );
      } else if (speechResult.error) {
        toast({
          variant: 'destructive',
          title: 'Audio Generation Failed',
          description: speechResult.error,
        });
      }
    }
  };

  const handleFollowUp = async (values: z.infer<typeof followUpSchema>) => {
    if (!currentOrganism) return;

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: <p>{values.question}</p>,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    form.reset();

    const previousAnswers = messages
      .filter((m) => m.role === 'assistant' && m.audioData) // Check for audioData existence
      .map((m) => (m.content as React.ReactElement)?.props?.children?.props?.textForTts) // Attempt to get text, may need rework
      .join('\n');

    const { data, error } = await answerFollowUpAction({
      question: values.question,
      organismName: currentOrganism.commonName,
      previousAnswer: previousAnswers,
    });
    
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Answer Failed',
        description: error,
      });
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: <p>I had trouble finding an answer. Please try asking differently.</p>,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    if (data) {
      const assistantMessageId = nanoid();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: <p>{data.answer}</p>,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Generate speech
      const speechResult = await generateSpeechAction({ text: data.answer });
      if (speechResult.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, audioData: speechResult.data.audio } : msg
          )
        );
      } else if (speechResult.error) {
         toast({
          variant: 'destructive',
          title: 'Audio Generation Failed',
          description: speechResult.error,
        });
      }
    }
  };

  const showUploadForm = !currentOrganism && !messages.some(msg => msg.role === 'user' && msg.id !== 'initial');


  return (
    <div className="flex flex-col w-full max-w-2xl h-full mx-auto bg-card rounded-lg shadow-2xl border border-primary/20 sm:h-auto sm:max-h-[90dvh]">
      <div className="flex items-center p-4 border-b border-primary/20">
        <BotIcon className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-semibold ml-3">BioGenius Pro</h1>
      </div>

      <ScrollArea className="flex-1 p-4" ref={chatContainerRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}
          {isLoading && (
            <ChatMessage
              id="loading"
              role="assistant"
              content={<LoaderCircle className="animate-spin text-primary" />}
            />
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-primary/20">
        {showUploadForm ? (
          <ImageUploadForm onImageUpload={handleImageUpload} disabled={isLoading} />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFollowUp)} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder={
                          currentOrganism
                            ? `Ask about the ${currentOrganism.commonName}...`
                            : 'Ask a question...'
                        }
                        {...field}
                        disabled={isLoading || !currentOrganism}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isLoading || !currentOrganism}>
                <ArrowRight className="w-5 h-5" />
                <span className="sr-only">Send</span>
              </Button>
              {currentOrganism && (
                <Button type="button" size="icon" variant="outline" onClick={handleReset} disabled={isLoading}>
                  <RefreshCcw className="w-5 h-5" />
                  <span className="sr-only">Start Over</span>
                </Button>
              )}
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
