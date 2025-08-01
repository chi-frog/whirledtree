'use client';
import JournalWriterCanvas from '@/components/JournalWriterCanvas';
import JournalWriterOptions from './JournalWriterOptions';
import { useState } from 'react';

export default function JournalWriter({}) {
  const [font, setFont] = useState<string>("Arial");

  const availableFonts = ["Aharoni", "Arial", "Helvetica"];

  const notifyFontChange = (font:string) => {

  };

  const OPTIONS_PADDING = 20;
  
  return (
    <>
      <JournalWriterCanvas/>
      <JournalWriterOptions
        left={OPTIONS_PADDING}
        top={OPTIONS_PADDING}
        font={"Arial"}
        fontSize={16}
        fonts={availableFonts}
        notifyFontChange={notifyFontChange}
      />
    </>
  );
}