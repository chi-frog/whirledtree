'use client';
import JournalWriterCanvas from '@/components/JournalWriterCanvas';
import JournalWriterOptions from './JournalWriterOptions';
import useFont, { Font } from '@/hooks/useFont';
import useElements from '@/hooks/useLeaves';

export default function JournalWriter({}) {
  const {font, setFont, fontSize, loadedFonts, maxWidth} = useFont();
  const {leaves, leafTb} = useElements();

  const OPTIONS_PADDING = 20;

  const notifySetFont = (font:Font) => {
    console.log('font change', font);
    setFont(font);
  }
  
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
        notifySetFont={notifySetFont}
      />
    </>
  );
}