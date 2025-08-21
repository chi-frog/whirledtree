'use client';
import JournalWriterCanvas from '@/components/JournalWriterCanvas';
import JournalWriterOptions from './JournalWriterOptions';
import useFont, { Font } from '@/hooks/useFont';
import useLeaves from '@/hooks/useLeaves';

export default function JournalWriter({}) {
  const {font, setFont, fontSize, loadedFonts, maxWidth, fontTb} = useFont();
  const {leaves, leafTb} = useLeaves();

  const OPTIONS_PADDING = 20;

  const notifySetFont = (font:Font) => {
    setFont(font);
  }
  
  return (
    <>
      <JournalWriterCanvas
        leaves={leaves}
        leafTb={leafTb}
        font={font}
        fontSize={fontSize}
        fontTb={fontTb}
        />
      <JournalWriterOptions
        left={OPTIONS_PADDING}
        top={OPTIONS_PADDING}
        font={font}
        fontSize={fontSize}
        availableFonts={loadedFonts}
        maxFontWidth={maxWidth}
        fontTb={fontTb}
        notifySetFont={notifySetFont}
      />
    </>
  );
}