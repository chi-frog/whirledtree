'use client';
import JournalWriterCanvas from '@/components/JournalWriterCanvas';
import JournalWriterOptions from './JournalWriterOptions';
import { element } from './Element';
import { useState } from 'react';
import useFont from '@/hooks/useFont';
import { REGION } from './Region';
import useElements from '@/hooks/useElements';

export default function JournalWriter({}) {
  const {font, fontSize, availableFonts} = useFont();
  const {elements, createElement, setElements} = useElements();

  const OPTIONS_PADDING = 20;
  
  return (
    <>
      <JournalWriterCanvas
        elements={elements}
        createElement={createElement}
        setElements={setElements}
        font={font}
        fontSize={fontSize}
        />
      <JournalWriterOptions
        left={OPTIONS_PADDING}
        top={OPTIONS_PADDING}
        font={font}
        fontSize={fontSize}
        notifyFontChange={() => null}
      />
    </>
  );
}