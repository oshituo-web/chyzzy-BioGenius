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
  scientificName: z.string().describe('The full scientific name of the organism (e.g., Genus species).'),
  familyName: z.string().describe('The family name of the organism.'),
  speciesName: z.string().describe('The species name of the organism.'),
  keyFeatures: z.array(z.string()).describe('A list of key features of the organism (e.g., size, color, habitat).'),
  interestingFacts: z.array(z.string()).describe('A list of 2-3 interesting facts about the organism.'),
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

You will use this information to identify the organism, and extract key information about it, including its common name, scientific name, family name, species name, key features, and 2-3 interesting facts.
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
