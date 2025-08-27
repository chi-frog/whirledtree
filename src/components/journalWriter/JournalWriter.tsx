'use client';
import Canvas from './Canvas';
import useFont, { Font } from '@/hooks/useFont';
import useLeaves from '@/hooks/useLeaves';
import Options from './options/Options';

export default function JournalWriter({}) {
  const {font, setFont, fontSize, loadedFonts, maxWidth, fontTb} = useFont();
  const {leaves, leafTb} = useLeaves();

  const OPTIONS_PADDING = 20;

  const notifySetFont = (font:Font) => {
    setFont(font);
  }
  
  return (
    <>
      <Canvas
        leaves={leaves}
        leafTb={leafTb}
        font={font}
        fontSize={fontSize}
        fontTb={fontTb}
        />
      <Options
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