'use client'

import { useEffect, useRef, useState } from "react";
import FontOption from "./FontOption"
import { Font, FontTb } from "@/hooks/useFont";
import useAnimation from "@/hooks/useAnimation";
import TextBox from "./svg/TextBox";

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
  fontTb:FontTb,
  notifySetFont:Function,
}

export default function JournalWriterOptions({left, top, font, fontSize,
  availableFonts, maxFontWidth, fontTb, notifySetFont} : journalWriterOptionsProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [focusedOption, setFocusedOption] = useState<string>("");
  
  const fontDims = font.getDims(fontSize);

  const fontLabelWidth = fontDims.width;
  const fontLabelHeight = fontDims.height;

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

  const [width, height, opacity, cornerRadiusPercentage] = useAnimation(
    [getWidth, getHeight, getOpacity, getCornerRadiusPercentage],
    [expanded, focusedOption, fontDims]);

  const optionsRef = useRef<SVGSVGElement>(null);

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
        <TextBox
          x={options.border.padding}
          y={options.border.padding}
          padding={options.text.padding}
          cornerRadiusPercentage={cornerRadiusPercentage}
          text={font.name}
          font={font}
          fontSize={fontSize}
          fontTb={fontTb}
          onMouseDown={fontHandleMouseDown} />}
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
        fontTb={fontTb}
        notifyMouseLeave={handleOptionLeave}
        notifySetFont={notifySetFont}/>
      }
    </svg>
    </div>
  );
}
