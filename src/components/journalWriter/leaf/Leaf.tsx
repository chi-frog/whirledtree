'use client'
import Options from '@/components/journalWriter/leaf/options/Options';
import { KeyboardEventHandler, MouseEventHandler, useEffect, useState } from 'react';
import { Leaf as LeafType } from '@/hooks/useLeaves';
import { Font, FontTb } from '@/hooks/useFont';
import Content from './Content';

type Props = {
  leaf:LeafType,
  ref?:any,
  map?:any,
  selected:boolean,
  focused:boolean,
  leafFontTb:FontTb,
  systemFont:Font,
  systemFontSize:number,
  systemFontTb:FontTb,
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
    leafFontTb,
    systemFont, systemFontSize, systemFontTb,
    notifyParentFocused, notifyChangeFontSize,
    handleMouseDown, handleMouseUp, parentOnBlur, handleKeyDown, handleKeyUp} : Props) {
  const [optionsExpanded, setOptionsExpanded] = useState<boolean>(false);
  const cursorDims = leafFontTb.getDims("I", leaf.font, leaf.fontSize);
  const textDims = leafFontTb.getDims(leaf.content, leaf.font, leaf.fontSize);

  useEffect(() => {
    if (focused)
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
  
  return (<>
    <Content
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
    {selected &&
    <Options
      leaf={leaf}
      x={leaf.x}
      y={leaf.y}
      notifyParentFocused={notifyParentFocused}
      notifyChangeFontSize={notifyChangeFontSize}
      expanded={optionsExpanded}
      systemFont={systemFont}
      systemFontSize={systemFontSize}
      systemFontTb={systemFontTb}
      parentMouseEnter={handleMouseOptionsEnter}
      parentMouseLeave={handleMouseOptionsLeave}
      />
    }
    </>);
}