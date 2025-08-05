'use client';
import JournalWriterCanvas from '@/components/JournalWriterCanvas';
import JournalWriterOptions from './JournalWriterOptions';
import useFont from '@/hooks/useFont';
import useElements from '@/hooks/useElements';

export default function JournalWriter({}) {
  const {font, fontSize, availableFonts} = useFont();
  const {elements, tbElements} = useElements();

  const OPTIONS_PADDING = 20;
  
  return (
    <>
      <JournalWriterCanvas
        elements={elements}
        tbElements={tbElements}
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