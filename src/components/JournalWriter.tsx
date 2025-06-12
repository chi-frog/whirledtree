'use client';
import React from 'react';
import { useState, useEffect, useRef, } from 'react';

const EditableElement = (props:any) => {
  const { onChange } = props;
  const element = useRef<HTMLInputElement>(null);

  if (props.children.length > 1) {
    throw Error("Can't have more than one child");
  } else if (!onChange) {
    throw Error("Need onChange");
  }

  const onMouseUp = () => {
    const value = element.current?.value || element.current?.innerText;
    onChange(value);
  };

  useEffect(() => {
    const value = element.current?.value || element.current?.innerText;
    onChange(value);
  }, []);

  let elements = React.cloneElement(React.Children.toArray(props.children)[0] as React.ReactElement<any>, {
    contentEditable: true,
    suppressContentEditableWarning: true,
    ref: element,
    onKeyUp: onMouseUp
  });

  return elements;
};

function Element({x, y, i} : {x:number, y:number, i:number}) {
  const [content, setContent] = useState<string>("hi");

  const handleChange = (content:string) => {
    console.log('handleChange ' + content);
    setContent(content);
  };

  return (
    <EditableElement onChange={handleChange}>
    <svg
      style={{
        width: 5,
        height:10,
        left: x,
        top: y,
        position: 'absolute',
      }}>
      <text x={0} y={0}>
        {content}
      </text>
    </svg>
    </EditableElement>
  );
}

export default function JournalWriter() {
  const [mouseDownX, setMouseDownX] = useState<number|null>(null);
  const [mouseDownY, setMouseDownY] = useState<number|null>(null);
  const [elements, setElements] = useState<any[]>([]);

  const INPUT_STATE = {
    FREE: {text: 'free'},
    WRITING: {text: 'writing'},
  }
  const [inputState, setInputState] = useState(INPUT_STATE.FREE)

  const printState = () => {
    console.log('mouseDownX:' + mouseDownX + ' mouseDownY:' + mouseDownY + ' inputState:' + inputState);
  }

  const handleMouseDown = (x:number, y:number, target:Element|null) => {
    console.log('handleMouseDown at (' + x + ',' + y + ')');
    printState();

    
    if (target && target.nodeName !== "TEXTAREA") {
      setMouseDownX(x);
      setMouseDownY(y);
    }
  }

  const handleMouseUp = (x:number, y:number) => {
    console.log('handleMouseUp at (' + x + ',' + y + ')');
    printState();

    if ((mouseDownX === null) ||
        (mouseDownY === null)) {
      console.log('mouseDownX or mouseDownY was null');
      return;
    }

    let distance = Math.sqrt(Math.pow(y-mouseDownY, 2) + Math.pow(x-mouseDownX, 2));

    if (distance <= 5) {
      const DEFAULT_OFFSET_X = 10;
      const DEFAULT_OFFSET_Y = 15;

      const top = y - DEFAULT_OFFSET_Y;
      const left = x - DEFAULT_OFFSET_X;

      setElements(elements.concat(<Element x={top} y={left} key={elements.length}/>));
    }

    setMouseDownX(null);
    setMouseDownY(null);
  }

  return (
    <div className="bg-rose-50 w-screen h-screen cursor-default"
         onMouseDown={(e) => handleMouseDown(e.clientX, e.clientY, e.target as Element)}
         onMouseUp={(e) => handleMouseUp(e.clientX, e.clientY)}>
      {...elements}
    </div>
  );
}
