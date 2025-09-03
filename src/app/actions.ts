
'use server';

import {
  answerFollowUpQuestions,
  AnswerFollowUpQuestionsInput,
} from '@/ai/flows/answer-follow-up-questions-about-organism';
import {
  generateSpeechFromText,
  GenerateSpeechFromTextInput,
} from '@/ai/flows/generate-speech-from-text';
import {
  identifyOrganismFromImage,
  IdentifyOrganismFromImageInput,
  IdentifyOrganismFromImageOutput,
} from '@/ai/flows/identify-organism-from-image';

export async function identifyOrganismAction(
  input: IdentifyOrganismFromImageInput
): Promise<{ data: IdentifyOrganismFromImageOutput | null; error: string | null }> {
  try {
    const result = await identifyOrganismFromImage(input);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to identify organism. ${errorMessage}` };
  }
}

export async function answerFollowUpAction(
  input: AnswerFollowUpQuestionsInput
): Promise<{ data: { answer: string } | null; error: string | null }> {
  try {
    const result = await answerFollowUpQuestions(input);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to get an answer. ${errorMessage}` };
  }
}

export async function generateSpeechAction(
  input: GenerateSpeechFromTextInput
): Promise<{ data: { audio: string } | null; error: string | null }> {
  try {
    const result = await generateSpeechFromText(input);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to generate audio. ${errorMessage}` };
  }
}
