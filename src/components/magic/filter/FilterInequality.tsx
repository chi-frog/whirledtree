'use client'

import { Fragment, memo, PointerEventHandler, useRef, useState } from "react";
import { SelectionChangeFunction, SelectedSection, operators } from "@/hooks/magic/useSelection";
import Section from "./FilterSection";
import Connector from "./FilterConnector";

export const colorWheel:string[] = [
  'rgb(248, 231, 185)',
  'rgb(179, 206, 234)',
  'rgb(166, 159, 157)',
  'rgb(235, 159, 130)',
  'rgb(196, 211, 202)',
]

export const defaultCoords = {x:-1, y:-1};

type Props = {
  id:string,
  text:string,
  sections:SelectedSection[],
  onChange:SelectionChangeFunction,
};
const FilterInequality:React.FC<Props> = ({
  id,
  text,
  sections,
  onChange
}) => {
  const [allVisible, setAllVisible] = useState<boolean>(false);
  const mouseCoords = useRef<{x:number, y:number}>(defaultCoords);
  const [mousedover, setMousedover] = useState<boolean>(false);
  const [labelMousedover, setLabelMousedover] = useState<boolean>(false);

  const onPointerDown:PointerEventHandler = (e) => {
    mouseCoords.current = {x:e.clientX, y:e.clientY};
  };
  const onPointerUp:PointerEventHandler = (e) => {
    if ((mouseCoords.current.x === e.clientX) &&
        (mouseCoords.current.y === e.clientY))
      setAllVisible((prev) => !prev);
  };

  const onPointerEnter:PointerEventHandler = () => setMousedover(true);
  const onPointerLeave:PointerEventHandler = () => setMousedover(false);
  const onLabelPointerEnter:PointerEventHandler = () => setLabelMousedover(true);
  const onLabelPointerLeave:PointerEventHandler = () => setLabelMousedover(false);

  const validate = (input:string) => {
    var value:string = input.trim()
    var foundOperator = null

    for (var i = 0; i < operators.length; i++) {
      var operator = operators[i];
      if (value.substring(0, operator.length) === operator) {
        foundOperator = operator;
        break;
      }
    }

    if (foundOperator)
      value = value.substring(foundOperator.length)
    else
      foundOperator = operators[operators.length-1] /* = */

    return (Number.isInteger(Number(value))) ?
      {operator:foundOperator, value} : false;
  }

  return (
  <div
    onPointerEnter={onPointerEnter}
    onPointerLeave={onPointerLeave}
    style={{
    color:'black',
    borderRadius: '5px',
    maxHeight: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 5px 2px 5px',
    zIndex:1,
    }}>
    <label
      title='Show All Sections'
      htmlFor={id} 
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onLabelPointerEnter}
      onPointerLeave={onLabelPointerLeave}
      style={{
        marginRight: 2,
        padding:5,
        color:'white',
        fontWeight: 'bold',
        textWrap: 'nowrap',
        cursor:'pointer',
        borderRadius:5,
        whiteSpaceCollapse: 'preserve-spaces',
        boxShadow:(labelMousedover) ? '0px 0px 8px white inset, 0px 0px 4px white' : '',
      }}>
      {text}
    </label>
    {...sections.map((section, index) => {
      const last = (index === (sections.length - 1));

      return (<Fragment key={index + id}>
        <Section
          section={section}
          previousConnector={sections[index-1] ? sections[index-1].connector : 'and'}
          index={index}
          last={last}
          buttonMousedover={mousedover}
          visible={allVisible}
          onChange={onChange}
          validateChange={validate}/>
        {(!last && (index !== (sections.length - 2))) &&
        <Connector
          section={section}
          buttonMousedOver={mousedover}
          index={index}
          onChange={onChange}/>}
      </Fragment>);
    })}
  </div>
)};

export default memo(FilterInequality);