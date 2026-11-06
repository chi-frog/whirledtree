'use client'

import { SelectedSection, SelectionChangeFunction } from "@/hooks/magic/useSelection";
import { useState, useRef, PointerEventHandler, useMemo, useEffect } from "react";
import { defaultCoords } from "./FilterButton";

type ConnectorProps = {
  section:SelectedSection,
  index:number,
  buttonMousedOver:boolean,
  onChange:SelectionChangeFunction
};

const Connector:React.FC<ConnectorProps> = ({
  section,
  index,
  buttonMousedOver,
  onChange,
}) => {
  const [mousedover, setMousedover] = useState<boolean>(false);
  const [shown, setShown] = useState<boolean>(false);
  const mouseCoords = useRef<{x:number, y:number}>(defaultCoords);

  const onPointerEnter:PointerEventHandler = () => {
    setMousedover(true)
    setShown(true)
  };

  const onPointerLeave:PointerEventHandler = () =>
    setMousedover(false)

  const and = useMemo(() => (section.connector === 'and'), [section.connector]);

  const onPointerDown: PointerEventHandler = (e) => {
    mouseCoords.current = {x: e.clientX, y: e.clientY};
  };

  const onPointerUp: PointerEventHandler = (e) => {
    const dx = Math.abs(e.clientX - mouseCoords.current.x);
    const dy = Math.abs(e.clientY - mouseCoords.current.y);
    if (dx < 5 && dy < 5) 
      onChange({connector:(and) ? 'or' : 'and'}, index);
  };

  useEffect(() => {
    if (!buttonMousedOver)
      setShown(false)
  }, [buttonMousedOver]);

  const backgroundColor = useMemo(() => {
    if (and) {
      return (mousedover) ? 'turquoise' : 'aquamarine'
    } else {
      return (mousedover) ? 'sienna' : 'rosybrown'
    }
  }, [and, mousedover]);

  return (
    <div
      key={index + 'connector'}
      title={(and) ? 'Change to OR' : 'Change to AND'}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        backgroundColor:backgroundColor,
        borderRadius:'50%',
        height:(shown) ? '30%' : '15%',
        aspectRatio:1,
        zIndex:20,
        cursor:'pointer',
        boxShadow:(mousedover) ?
          '0px 0px 5px black inset, white 0px 0px 5px' :
          '0px 0px 5px black inset',
        textAlign:'center',
        transition:'height 0.2s ease-in-out, width 0.2s ease-in-out',
      }}>
      <span
        style={{
          opacity:(shown) ? '1' : '0',
          transition:'opacity 0.2s ease-in-out',
          pointerEvents:'none',
        }}>
        {(and) ? '&' : '|'}
      </span>
    </div>);
};

export default Connector;