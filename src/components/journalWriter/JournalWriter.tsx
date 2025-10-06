'use client';
import Canvas from './Canvas';
import useFonts, { Font, Fonts, defaultFont } from '@/hooks/useFonts';
import useLeaves from '@/hooks/useLeaves';
import Options from './options/Options';
import { createContext, useContext, useState } from 'react';

const _ = {
  options: {
    padding: {
      x: 20,
      y: 20,
    }
  }
}

const SystemFontContext = createContext<Font>(defaultFont);
const FontsContext = createContext<Fonts|undefined>(undefined);

export const useSystemFontContext = () => {
  const ctx = useContext(SystemFontContext);

  if (ctx === undefined)
    throw new Error("useSystemFontContext not available");

  return ctx;
}

export const useFontsContext = () => {
  const ctx = useContext(FontsContext);

  if (ctx === undefined)
    throw new Error("useFontsContext not available");

  return ctx;
}

export default function JournalWriter({}) {
  const fonts = useFonts();
  const {leaves, leafTb} = useLeaves();

  const [leafFont, setLeafFont] = useState<Font>(fonts.find());
  const [systemFont, setSystemFont] = useState<Font>(fonts.find());



  const notifySetLeafFont = (font:Font) =>
    setLeafFont(font);
  
  return (
    <SystemFontContext value={systemFont}>
    <FontsContext value={fonts}>
      <Canvas
        leaves={leaves}
        leafTb={leafTb}
        leafFont={leafFont} />
      <Options
        left={_.options.padding.x}
        top={_.options.padding.y}
        leafFont={leafFont}
        notifySetFont={notifySetLeafFont} />
    </FontsContext>
    </SystemFontContext>
  );
}