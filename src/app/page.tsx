import ChatInterface from '@/components/chat-interface';

export default function Home() {
  return (
    <main className="relative flex h-[100dvh] w-full flex-col items-center justify-center bg-background p-4">
      <ChatInterface />
    </main>
  );
}
