import { useEffect, useLayoutEffect, useRef, useState } from "react";

type elementInputProps = {
  id:number,
  x:number,
  y:number,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  parentWidth:number,
  parentHeight:number,
  fontSize:number,
  elementFontSize:number,
}

export default function ElementInput({id, x, y, notifyParentFocused, notifyChangeFontSize, parentWidth, parentHeight, fontSize, elementFontSize} : elementInputProps) {
  const [focused, setFocused] = useState(false);
  const [desiredFontSize, setDesiredFontSize] = useState<string>("" + elementFontSize);
  const [textHeight, setTextHeight] = useState<number>(fontSize);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
      if (!ref || !ref.current) return;

      const bbox = ref.current.querySelector('text')?.getBBox();
      if((!bbox) ||
         (bbox.height === 0)) return;

         console.log('bbox', bbox);
  
      setTextHeight(bbox.height);
    }, [ref]);

  const handleKeyDown = (e:React.KeyboardEvent<SVGSVGElement>) => {
    const numberRegex = /^\d+$/;
    let newFontSize;

    if (numberRegex.test(e.key)) {
      newFontSize = desiredFontSize + e.key;

      if (parseInt(newFontSize) > 1638) return;
    } else {
      // Here we enable certain functionality
      switch (e.key) {
        case "Backspace":
          newFontSize = desiredFontSize.slice(0, desiredFontSize.length-1);
          break;
        case "Delete":
          newFontSize = "";
          break;
        default: return;
      }
    }

    setDesiredFontSize(newFontSize);
    if(notifyChangeFontSize) notifyChangeFontSize(newFontSize);
  }

  const handleMouseDown = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    setFocused(true);
  }

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
  }

  const handleBlur = () => {
    setFocused(false);
    if (notifyParentFocused)
      notifyParentFocused(false);
  }

  const handleFocus = () => {
    setFocused(true);
    if (notifyParentFocused)
      notifyParentFocused(true);
  }

  useLayoutEffect(() => {
    if (focused && ref)
      ref.current?.focus();
  }, [focused]);

  return (
    <svg
      x={parentWidth/2 - (parentHeight-10)/2}
      y={parentHeight/2 - (parentHeight-10)/2}
      width={parentHeight-10}
      height={parentHeight-10}
      ref={ref} tabIndex={0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseUp={(e) => handleMouseUp(e)}
      onKeyDown={(e) => handleKeyDown(e)}
      style={{
        outline: focused ? "1px solid yellow" : "none",
        overflow: "scroll",
        cursor: "text",
      }}
    >
    <rect
      width={parentHeight - 10}
      height={parentHeight - 10}
      rx={5}
      fill="white">
    </rect>
    <text
      x={'50%'}
      y={'50%'}
      dominantBaseline={'middle'}
      textAnchor={'middle'}
      fontSize={fontSize}>
      {""+desiredFontSize}
    </text>
    </svg>
  );
}