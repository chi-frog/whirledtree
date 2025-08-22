'use client'
import LeafOptions from '@/components/LeafOptions';
import { KeyboardEventHandler, MouseEventHandler, useEffect, useRef, useState } from 'react';
import '../app/journalWriter.css';
import Cursor from './Cursor';
import { Leaf as LeafType } from '@/hooks/useLeaves';
import { Font, FontTb } from '@/hooks/useFont';
import LeafContent from './LeafContent';

type Props = {
  leaf:LeafType,
  ref?:any,
  map?:any,
  selected:boolean,
  focused:boolean,
  systemFont:Font,
  systemFontSize:number,
  fontTb:FontTb,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  handleMouseDown?:MouseEventHandler<SVGTextElement>,
  handleMouseUp?:MouseEventHandler<SVGTextElement>,
  parentOnBlur?:Function,
  handleKeyDown?:KeyboardEventHandler<SVGTextElement>,
  handleKeyUp?:KeyboardEventHandler<SVGTextElement>,
}

export default function Leaf({
    leaf, ref, map,
    selected, focused,
    systemFont, systemFontSize, fontTb,
    notifyParentFocused, notifyChangeFontSize,
    handleMouseDown, handleMouseUp, parentOnBlur, handleKeyDown, handleKeyUp} : Props) {
  const [optionsExpanded, setOptionsExpanded] = useState<boolean>(false);
  
  const cursorDims = fontTb.getDims("I", leaf.font, leaf.fontSize);
  const textDims = fontTb.getDims(leaf.content, leaf.font, leaf.fontSize);

  useEffect(() => {
    map.get(leaf.id).focus();
  }, [focused])

  const handleOnBlur = () => {
    if (parentOnBlur)
      parentOnBlur();
  };

  const handleMouseOptionsEnter = () => setOptionsExpanded(true);

  const handleMouseOptionsLeave = () => {
    if (!leaf.optionsFocused)
      setOptionsExpanded(false);
  }
  
  return (<g>
    <LeafContent
      leaf={leaf}
      ref={ref}
      selected={selected}
      focused={focused}
      textDims={textDims}
      cursorDims={cursorDims}
      handleMouseDown={handleMouseDown}
      handleMouseUp={handleMouseUp}
      handleOnBlur={handleOnBlur}
      handleKeyDown={handleKeyDown}
      handleKeyUp={handleKeyUp} />
    {selected && null
    /*<LeafOptions
      leaf={leaf}
      x={leaf.x}
      y={leaf.y}
      textHeight={textDims.textHeight}
      notifyParentFocused={notifyParentFocused}
      notifyChangeFontSize={notifyChangeFontSize}
      expanded={optionsExpanded}
      systemFont={systemFont}
      systemFontSize={systemFontSize}
      fontTb={fontTb}
      parentMouseEnter={handleMouseOptionsEnter}
      parentMouseLeave={handleMouseOptionsLeave}
      />*/
    }
    </g>);
}