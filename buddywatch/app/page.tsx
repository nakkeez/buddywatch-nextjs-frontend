"use client";
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

export default function Home() {
  const webcamRef = useRef<Webcam>(null);

  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  return (
    <main className="flex h-screen flex-col items-center p-24">
      <section className="max-w-7xl relative">
        <h1 className="text-2xl">BuddyWatch</h1>
        <div className="border-2 relative w-full">
          <Webcam
            ref={webcamRef}
            mirrored={isMirrored}
            className="h-full w-full object-contain p-2 relative z-10"
          ></Webcam>
        </div>
      </section>
    </main>
  );
}
