'use server';
/**
 * @fileOverview An organism identification AI agent.
 *
 * - identifyOrganismFromImage - A function that handles the organism identification process.
 * - IdentifyOrganismFromImageInput - The input type for the identifyOrganismFromImage function.
 * - IdentifyOrganismFromImageOutput - The return type for the identifyOrganismFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyOrganismFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an organism, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  region: z.string().optional().describe('The geographical region where the organism was found.'),
});
export type IdentifyOrganismFromImageInput = z.infer<typeof IdentifyOrganismFromImageInputSchema>;

const IdentifyOrganismFromImageOutputSchema = z.object({
  commonName: z.string().describe('The common name of the organism, specific to the provided region if available.'),
  scientificName: z.string().describe('The scientific name of the organism.'),
  species: z.string().describe('The species of the organism.'),
  family: z.string().describe('The family of the organism.'),
  keyFeatures: z.array(z.string()).describe('A list of key features of the organism.'),
  interestingFacts: z.array(z.string()).describe('A list of interesting facts about the organism.'),
});
export type IdentifyOrganismFromImageOutput = z.infer<typeof IdentifyOrganismFromImageOutputSchema>;

export async function identifyOrganismFromImage(input: IdentifyOrganismFromImageInput): Promise<IdentifyOrganismFromImageOutput> {
  return identifyOrganismFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyOrganismFromImagePrompt',
  input: {schema: IdentifyOrganismFromImageInputSchema},
  output: {schema: IdentifyOrganismFromImageOutputSchema},
  prompt: `You are an expert biologist specializing in identifying living organisms from images.

You will use this information to identify the organism, and extract key information about it, including common name, scientific name, species, family, key features, and interesting facts.
{{#if region}}
The user has specified the region as {{region}}. Use this information to provide a more accurate common name for that region if available.
{{/if}}

Analyze the following image and extract the required information.

Photo: {{media url=photoDataUri}}`,
});

const identifyOrganismFromImageFlow = ai.defineFlow(
  {
    name: 'identifyOrganismFromImageFlow',
    inputSchema: IdentifyOrganismFromImageInputSchema,
    outputSchema: IdentifyOrganismFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
