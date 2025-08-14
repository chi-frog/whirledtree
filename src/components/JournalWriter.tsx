'use client';
import JournalWriterCanvas from '@/components/JournalWriterCanvas';
import JournalWriterOptions from './JournalWriterOptions';
import useFont from '@/hooks/useFont';
import useElements from '@/hooks/useLeaves';
import { useState } from 'react';

export default function JournalWriter({}) {
  const {font, fontSize, loadedFonts, maxWidth} = useFont();
  //const {canvasFontIndex, setCanvasFontIndex} = useState<number>(loadedFonts.findIndex((_font) => _font.name === font.name));
  const {leaves, leafTb} = useElements();

  const OPTIONS_PADDING = 20;
  
  return (
    <>
      <JournalWriterCanvas
        leaves={leaves}
        leafTb={leafTb}
        font={font}
        fontSize={fontSize}
        />
      <JournalWriterOptions
        left={OPTIONS_PADDING}
        top={OPTIONS_PADDING}
        font={font}
        fontSize={fontSize}
        availableFonts={loadedFonts}
        maxFontWidth={maxWidth}
        notifyFontChange={() => null}
      />
    </>
  );
}