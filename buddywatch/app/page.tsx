import WebcamView from '@/components/WebcamView';
import Header from '@/components/Header';

export default function HomePage() {
  return (
    <>
      <header>
        <Header />
      </header>
      <main className="flex h-screen flex-col items-center p-24">
        <WebcamView />
      </main>
    </>
  );
}
