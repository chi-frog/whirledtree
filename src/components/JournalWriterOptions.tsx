'use client'

import { useEffect, useRef, useState } from "react";
import FontOption from "./FontOption"
import { Font } from "@/hooks/useFont";

export const options = {
  unexpanded: {
    width:30,
    height:30,
    opacity:0.7,
    cornerRadiusPercentage:0.5,
  },
  expanded: {
    fallback:{
      width:80,
      height:40,
    },
    opacity:1,
    cornerRadiusPercentage:0.1,
  },
  border: {
    padding:5,
  },
  text: {
    padding: {
      x:5,
      y:2,
    }
  },
}

type journalWriterOptionsProps = {
  left:number,
  top:number,
  font:Font,
  fontSize:number,
  availableFonts:Font[],
  maxFontWidth:number,
  notifySetFont:Function,
}

export default function JournalWriterOptions({left, top, font, fontSize,
  availableFonts, maxFontWidth, notifySetFont} : journalWriterOptionsProps) {
  const [focusedOption, setFocusedOption] = useState<string>("");
  
  const fontDims = font.getDims(fontSize);

  const fontLabelWidth = font.loaded ? fontDims.width : 0;
  const fontLabelHeight = font.loaded ? fontDims.height : 0;

  const getWidth = () =>
    (expanded) ?
      (fontLabelWidth) ?
        (fontLabelWidth + options.text.padding.x*2 + options.border.padding*2) :
        (options.expanded.fallback.width) :
      (options.unexpanded.width);

  const getHeight = () =>
    (expanded) ?
      (fontLabelHeight) ?
        (fontLabelHeight + options.text.padding.y*2 + options.border.padding*2) :
        (options.expanded.fallback.height) :
      (options.unexpanded.height);

  const getOpacity = () =>
    (expanded) ?
      options.expanded.opacity :
      options.unexpanded.opacity;

  const getCornerRadiusPercentage = () =>
    (expanded) ?
      options.expanded.cornerRadiusPercentage :
      options.unexpanded.cornerRadiusPercentage;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(getWidth());
  const [height, setHeight] = useState<number>(getHeight());
  const [opacity, setOpacity] = useState<number>(getOpacity());
  const [cornerRadiusPercentage, setCornerRadiusPercentage] = useState<number>(getCornerRadiusPercentage());

  const targetWidth = getWidth();
  const targetHeight = getHeight();
  const targetOpacity = getOpacity();
  const targetCornerRadiusPercentage = getCornerRadiusPercentage();
  const animationRef = useRef(0);

  const optionsRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
      cancelAnimationFrame(animationRef.current);
  
      let start:number;
      const initialWidth = width;
      const initialHeight = height;
      const initialOpacity = opacity;
      const initialCornerRadiusPercentage = cornerRadiusPercentage;
      const duration = 100;
  
      function animate(time:number) {
        if (!start) start = time;
  
        const progress = Math.min((time-start) / duration, 1);
  
        setWidth(initialWidth + (targetWidth-initialWidth)*progress);
        setHeight(initialHeight + (targetHeight-initialHeight)*progress);
        setOpacity(initialOpacity + (targetOpacity-initialOpacity)*progress);
        setCornerRadiusPercentage(Math.min(5, initialCornerRadiusPercentage + (targetCornerRadiusPercentage-initialCornerRadiusPercentage)*progress));
  
        if (progress < 1)
          animationRef.current = requestAnimationFrame(animate);
      }
  
      animationRef.current = requestAnimationFrame(animate);
  
      return () => cancelAnimationFrame(animationRef.current);
    }, [expanded, focusedOption, fontLabelWidth, fontLabelHeight, maxFontWidth,]);

  const handleMouseEnter = () => setExpanded(true);

  const handleMouseLeave = () => {
    setExpanded(false)
    setFocusedOption("")};

  const handleOptionLeave = () => {
    //setFocusedOption("");
  }

  const handleMouseDown = (e:any) => {
    if (focusedOption)
      e.preventDefault();

    e.stopPropagation();
  }

  const fontHandleMouseDown = (e:any) => {
    e.stopPropagation();

    setFocusedOption("font");
  }

  const handleFocus = () => {
    optionsRef.current?.focus();
  }

  const handleBlur = () => {
    setFocusedOption("");
  }

  const svgWidth =
    (focusedOption === "") ?
      width :
      (focusedOption === "font") ?
        width + maxFontWidth + options.text.padding.x*2 + options.border.padding*2 :
        0;

  const svgHeight =
    (focusedOption === "") ?
      height :
      (focusedOption === "font") ?
        (fontDims.height + options.text.padding.y*2 + options.border.padding)*5 + options.border.padding :
        0;

  return (
    <div
      className="absolute"
      style={{
        left:left + "px",
        top:top + "px"
      }}>
    <svg
      ref={optionsRef} tabIndex={0}
      width={svgWidth}
      height={svgHeight}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}>
      <rect
        width={width}
        height={height}
        fill='#ADD8E6'
        rx={width*cornerRadiusPercentage}
        ry={height*cornerRadiusPercentage}
        opacity={opacity}
        />
      {expanded &&
      <rect
        className="hover:fill-gray-200 hover:cursor-pointer hover:stroke-yellow-600"
        x={options.border.padding}
        y={options.border.padding}
        width={fontLabelWidth + options.text.padding.x*2}
        height={fontLabelHeight + options.text.padding.y*2}
        rx={fontLabelWidth*cornerRadiusPercentage}
        ry={fontLabelHeight*cornerRadiusPercentage}
        stroke={"black"}
        fill={'white'}
        onMouseDown={fontHandleMouseDown}>
        </rect>}
      {expanded &&
        <text
          className="cursor-pointer"
          x={options.border.padding + (fontLabelWidth + options.text.padding.x*2)/2 - fontLabelWidth/2}
          y={options.border.padding + (fontLabelHeight + options.text.padding.y*2)/2 + fontLabelHeight/2 - fontDims.textHeightGap}
          fontSize={fontSize}
          style={{
            pointerEvents:'none',
            fontFamily:font.name,
          }}>
          {font.name}
        </text>
      }
      {expanded && (focusedOption === "font") &&
      <rect
        x={fontLabelWidth + options.text.padding.x*2 + options.border.padding*2 - 3}
        width={6}
        height={height}
        fill='#ADD8E6'
        opacity={opacity}
        />
      }
      {expanded &&
      <FontOption
        focused={focusedOption === "font"}
        x={fontLabelWidth + options.text.padding.x*2 + options.border.padding*2}
        y={0}
        font={font}
        fontSize={fontSize}
        availableFonts={availableFonts}
        maxFontWidth={maxFontWidth}
        notifyMouseLeave={handleOptionLeave}
        notifySetFont={notifySetFont}/>
      }
    </svg>
    </div>
  );
}
