'use client'

import { useEffect, useRef, useState } from "react";
import FontOption from "./FontOption"
import { calcFontDims, calcMaxFontsWidth, Dimension, Font } from "@/hooks/useFonts";
import useAnimation from "@/hooks/useAnimation";
import TextBox from "../svg/TextBox";
import { useFontsContext, useSystemFontContext } from "../JournalWriter";
import { fitText } from "@/helpers/text";
import { useScrollContext } from "@/app/page";

export const options = {
  unexpanded: {
    width:30,
    height:30,
    opacity:0.7,
    cornerRadiusPercentage:0.5,
  },
  expanded: {
    width:80,
    height:30,
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

type Props = {
  left:number,
  top:number,
  leafFont:Font,
  notifySetFont:Function,
}

export default function Options({
    left, top,
    leafFont, notifySetFont} : Props) {
  const systemFont = useSystemFontContext();
  const fonts = useFontsContext();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [focusedOption, setFocusedOption] = useState<string>("");
  const [fontDims, setFontDims] = useState<Dimension>({width:0, height:0, textHeight:0, textHeightGap:0})
  const [maxFontWidth, setMaxFontWidth] = useState<number>(0);

  const {scrolling} = useScrollContext();

  useEffect(() => {
    if (!fonts.loaded) return;

    setMaxFontWidth(calcMaxFontsWidth((_font:Font)=>_font.name, fonts.all));
  }, [fonts.loaded, fonts.all]);

  useEffect(() => {
    setFontDims(calcFontDims(leafFont.name, systemFont));
  }, [leafFont.name, systemFont]);


  const getWidth = () =>
    (expanded) ?
      (options.expanded.width) :
      (options.unexpanded.width);

  const getHeight = () =>
    (expanded) ?
      (options.expanded.height) :
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
    [expanded]);

  const optionsRef = useRef<SVGSVGElement>(null);

  const handleMouseEnter = () => setExpanded(true);
  const handleMouseLeave = () => {
    if (focusedOption === "") {
      setExpanded(false)
      setFocusedOption("")}};

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

    if (focusedOption !== "font")
      setFocusedOption("font");
    else
      setFocusedOption("");
  }

  const handleFocus = () => {
    optionsRef.current?.focus();
  }

  const handleBlur = () => {
    setFocusedOption("");
    setExpanded(false);
  }

  const getSvgWidth = () =>
    (focusedOption === "") ?
      getWidth() :
      (focusedOption === "font") ?
        getWidth() + maxFontWidth + options.text.padding.x*2 + options.border.padding*2 :
        0;

  const getSvgHeight = () =>
    (focusedOption === "") ?
      getHeight() :
      (focusedOption === "font") ?
        (fontDims.height + options.text.padding.y*2 + options.border.padding)*5 + options.border.padding :
        0;

  const [svgWidth, svgHeight] = useAnimation(
    [getSvgWidth, getSvgHeight],
    [expanded, focusedOption]
  );

  const fontSizeLabelText = fitText(
    leafFont.name,
    options.expanded.width - options.border.padding*2 - options.text.padding.x*2,
    systemFont.name,
    systemFont.size,
    '#canvas');

  return (
    <div
      className={(scrolling) ? "absolute cursor-grabbing" : "absolute"}
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
        opacity={opacity}
        />
      {expanded &&
        <TextBox
          x={options.border.padding}
          y={options.border.padding}
          width={options.expanded.width - options.border.padding*2}
          height={options.expanded.height - options.border.padding*2}
          overflow="cut"
          padding={options.text.padding}
          cornerRadiusPercentage={cornerRadiusPercentage}
          text={fontSizeLabelText}
          font={systemFont}
          scrolling={scrolling}
          onMouseDown={fontHandleMouseDown} />}
      {expanded && (focusedOption === "font") &&
      <rect
        x={options.expanded.width}
        width={6}
        height={height}
        fill='#ADD8E6'
        opacity={opacity}
        />
      }
      {expanded &&
      <FontOption
        focused={focusedOption === "font"}
        x={options.expanded.width}
        y={0}
        maxFontWidth={maxFontWidth}
        notifyMouseLeave={handleOptionLeave}
        notifySetFont={notifySetFont}/>
      }
    </svg>
    </div>
  );
}
