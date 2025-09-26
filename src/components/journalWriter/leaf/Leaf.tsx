'use client'
import Options from '@/components/journalWriter/leaf/options/Options';
import { KeyboardEventHandler, MouseEventHandler, useEffect, useRef, useState } from 'react';
import { Leaf as LeafType } from '@/hooks/useLeaves';
import { calcFontDims, Dimension } from '@/hooks/useFonts';
import Content from './Content';
import { useFontsContext } from '../JournalWriter';

type Props = {
  leaf:LeafType,
  ref?:any,
  map?:any,
  selected:boolean,
  focused:boolean,
  notifyParentFocused?:Function,
  notifyChangeFontSize:Function,
  handleMouseDown?:MouseEventHandler<SVGTextElement>,
  handleMouseUp?:MouseEventHandler<SVGTextElement>,
  parentOnBlur?:Function,
  handleKeyDown?:KeyboardEventHandler<SVGTextElement>,
  handleKeyUp?:KeyboardEventHandler<SVGTextElement>,
}

const Leaf:React.FC<Props> = ({
    leaf, ref, map,
    selected, focused,
    notifyParentFocused, notifyChangeFontSize,
    handleMouseDown, handleMouseUp, parentOnBlur, handleKeyDown, handleKeyUp} : Props) => {
  const {find, all, loaded} = useFontsContext();
  const [optionsExpanded, setOptionsExpanded] = useState<boolean>(false);
  const calcCursorDims = () => calcFontDims("I", leaf.font);
  const [cursorDims, setCursorDims] = useState<Dimension>(calcCursorDims())
  const calcTextDims = () => calcFontDims(leaf.content, leaf.font);
  const [textDims, setTextDims] = useState<Dimension>(calcTextDims());

  useEffect(() => {
    if (!loaded) return;

    setCursorDims(calcCursorDims());
  }, [loaded, leaf.font]);

  useEffect(() => {
    if(!loaded) return;

    setTextDims(calcTextDims());
  }, [loaded, leaf]);

  useEffect(() => {
    if (focused)
      map.get(leaf.id).focus();
  }, [focused]);

  const handleOnBlur = () => {
    if (parentOnBlur)
      parentOnBlur();
  };

  const handleMouseOptionsEnter = () => {
    setOptionsExpanded(true);
    isOutside.current = false;
  };

  const isOutside = useRef<boolean>(false);

  const handleMouseOptionsLeave = () => {
    if (!leaf.optionsFocused)
      setOptionsExpanded(false);
    else
      isOutside.current = true;
  }

  const handleChangeFontSize = (size:number) => {
    if (isOutside.current)
      setOptionsExpanded(false);
    notifyChangeFontSize(size);
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
      notifyChangeFontSize={handleChangeFontSize}
      expanded={optionsExpanded}
      parentMouseEnter={handleMouseOptionsEnter}
      parentMouseLeave={handleMouseOptionsLeave}
      />
    }
    </>);
}

export default Leaf;