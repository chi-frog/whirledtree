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
  const ref = useRef<SVGTextElement>(null);

  const handleKeyDown = (e:React.KeyboardEvent<SVGGElement>) => {
    const numberRegex = /^\d+$/;

    if (numberRegex.test(e.key)) {
      const newFontSize = desiredFontSize + e.key;

      if (parseInt(newFontSize) > 1638) return;

      setDesiredFontSize(newFontSize);
    } else {
      // Here we enable certain functionality
      switch (e.key) {
        case "Backspace":
          setDesiredFontSize(desiredFontSize.slice(0, desiredFontSize.length-1));
          return;
        case "Delete":
          setDesiredFontSize("");
          return;
        default: return;
      }
    }
  }

  useEffect(() => {
    if (notifyChangeFontSize) notifyChangeFontSize(desiredFontSize);
  }, [desiredFontSize]);

  const handleMouseDown = (e:React.MouseEvent<SVGGElement, MouseEvent>) => {
    e.stopPropagation();
    setFocused(true);
  }

  const handleMouseUp = (e:React.MouseEvent<SVGGElement, MouseEvent>) => {
    e.stopPropagation();
  }

  const handleBlur = () => {
    setFocused(false);
  }

  const handleFocus = () => {
    setFocused(true);
  }

  useLayoutEffect(() => {
    if (notifyParentFocused)
      notifyParentFocused(focused);

    if (focused && ref)
      ref.current?.focus();
  }, [focused]);

  return (
    <g
      ref={ref} tabIndex={0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseUp={(e) => handleMouseUp(e)}
      onKeyDown={(e) => handleKeyDown(e)}
      style={{
        outline: focused ? "1px solid yellow" : "none",
        overflow: "scroll",
      }}
    >
    <rect
      x={x + 10}
      y={y}
      rx={5}
      width={parentHeight - 10}
      height={parentHeight - 10}
      fill="white">
    </rect>
    <text
      x={x+parentWidth/2-15}
      y={y+parentHeight/2}
      fontSize={fontSize}>
      {""+desiredFontSize}
    </text>
    </g>
  );
}