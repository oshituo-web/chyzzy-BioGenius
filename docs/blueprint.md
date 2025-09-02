# **App Name**: BioIdentifier Chatbot

## Core Features:

- Image Upload: Enable users to upload images of organisms for identification via drag-and-drop or file selection.
- AI Organism Identification: Leverage the Gemini Pro model, acting as a tool, to analyze uploaded images, identify the organism, and extract relevant information (common name, scientific name, key features, interesting facts).
- Chatbot Interface: Provide a conversational chat interface for presenting identification results and answering follow-up questions.
- Conversational Context Maintenance: Maintain context throughout the conversation to provide relevant and accurate answers to user questions.
- Text-to-Speech: Use Google Gemini TTS to read the generated analysis aloud with a play/pause button for user control.
- Session History: Save chat history and identification results for the duration of the user's session.
- Input Validation & Error Handling: Implement client-side validation for image file types/sizes and user-friendly error messages for API failures and unsupported files.

## Style Guidelines:

- Primary color: Saturated purple (#9400D3), offering a sense of both power and mystery.
- Background color: Very dark purple (#14001F), close to black, creates an immersive dark theme.
- Accent color: Light purple (#C15BFF), bright and attention-getting against the dark primary/background, and analogous to the primary color. 
- Font: 'Inter', a grotesque sans-serif, for both headlines and body text.
- Use minimalist icons from 'shadcn/ui' to represent different features and functionalities.
- Implement a fully responsive design using Tailwind CSS grid and flexbox to ensure optimal usability on all devices.
- Use subtle animations and transitions to provide a smooth and engaging user experience during image uploads and analysis.