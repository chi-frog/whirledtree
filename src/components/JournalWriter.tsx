'use client';
import JournalWriterCanvas from '@/components/JournalWriterCanvas';
import { useId, useRef } from 'react';

const DEFAULT_FONT_SIZE_ELEMENT = 16;
const DEFAULT_FONT_SIZE_OPTIONS = 14;

export default function JournalWriter({}) {
  const fontSizeId = useId();

  return (
    <div>
      <JournalWriterCanvas/>
      <label htmlFor={fontSizeId}
        className="hidden">
        Font Size
      </label>
      <input id={fontSizeId} name="fontSize" type="text"
        className="w-[30px] h-[30px] absolute left-50 top-55 bg-white"
        style={{
          color:"black",
          textAlign:"center",
          fontSize:DEFAULT_FONT_SIZE_OPTIONS,
        }}/>
    </div>
  );
}