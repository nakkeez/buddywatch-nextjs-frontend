import React from 'react';
import WebcamView from '@/components/WebcamView';

/**
 * Main page of the application.
 *
 * @returns {Promise<React.JSX.Element>} The main page of the application containing the WebcamView component
 */
export default async function HomePage(): Promise<React.JSX.Element> {
  return (
    <section className="mx-auto p-24">
      <WebcamView />
    </section>
  );
}
