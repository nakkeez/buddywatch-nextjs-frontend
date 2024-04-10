"use client";

import WebcamView from "../components/WebcamView";

export default function HomePage() {
  return (
    <main className="flex h-screen flex-col items-center text-center p-24">
      <h1 className="text-3xl">BuddyWatch</h1>
      <WebcamView />
    </main>
  );
}
