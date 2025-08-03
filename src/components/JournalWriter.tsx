'use client';
import JournalWriterCanvas from '@/components/JournalWriterCanvas';
import JournalWriterOptions from './JournalWriterOptions';
import { element } from './Element';
import { useState } from 'react';
import useId from '@/hooks/useId';
import useFont from '@/hooks/useFont';

export default function JournalWriter({}) {
  const { getId } = useId();
  const {font, fonts} = useFont();
  const [elements, setElements] = useState<element[]>([]);
  

  const OPTIONS_PADDING = 20;
  
  return (
    <>
      <JournalWriterCanvas elements={elements} setElements={setElements}/>
      <JournalWriterOptions
        left={OPTIONS_PADDING}
        top={OPTIONS_PADDING}
        font={"Arial"}
        fontSize={16}
        fonts={fonts}
        notifyFontChange={() => null}
      />
    </>
  );
}