import WebcamView from '@/components/WebcamView';

export default async function HomePage() {
  return (
    <main className="flex h-screen flex-col items-center p-24">
      <WebcamView />
    </main>
  );
}
