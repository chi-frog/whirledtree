'use client';
import Canvas from './Canvas';
import useFont, { Font } from '@/hooks/useFont';
import useLeaves from '@/hooks/useLeaves';
import Options from './options/Options';

export default function JournalWriter({}) {
  const {font:leafFont, setFont:setLeafFont, fontSize:leafFontSize, loadedFonts, maxWidth, fontTb:leafFontTb} = useFont();
  const {font:systemFont, setFont:setSystemFont, fontSize:systemFontSize, fontTb:systemFontTb} = useFont();
  const {leaves, leafTb} = useLeaves();

  const OPTIONS_PADDING = 20;

  const notifySetLeafFont = (font:Font) =>
    setLeafFont(font)
  
  return (
    <>
      <Canvas
        leaves={leaves}
        leafTb={leafTb}
        leafFont={leafFont}
        leafFontSize={leafFontSize}
        leafFontTb={leafFontTb}
        systemFont={systemFont}
        systemFontSize={systemFontSize}
        systemFontTb={systemFontTb}
        />
      <Options
        left={OPTIONS_PADDING}
        top={OPTIONS_PADDING}
        leafFont={leafFont}
        systemFont={systemFont}
        systemFontSize={systemFontSize}
        systemFontTb={systemFontTb}
        availableFonts={loadedFonts}
        maxFontWidth={maxWidth}
        notifySetFont={notifySetLeafFont}
      />
    </>
  );
}