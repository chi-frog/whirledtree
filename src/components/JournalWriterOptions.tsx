'use client'

import { useEffect, useRef, useState } from "react";
import FontOption from "./FontOption"
import { Dimension, Font } from "@/hooks/useFont";

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
  focused: {
    height:100,
  }
}

type journalWriterOptionsProps = {
  left:number,
  top:number,
  font:Font,
  fontSize:number,
  availableFonts:Font[],
  maxFontWidth:number,
  notifyFontChange:Function,
}

export default function JournalWriterOptions({left, top, font, fontSize,
  availableFonts, maxFontWidth, notifyFontChange} : journalWriterOptionsProps) {
  const [focusedOption, setFocusedOption] = useState<any>(0);
  
  const fontDims = font.getDims(fontSize);

  const fontOptionWidth = font.loaded ? fontDims.width : 0;
  const fontOptionHeight = font.loaded ? fontDims.height : 0;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [width, setWidth] = useState<number>((expanded) ?
    (fontOptionWidth>0) ? (fontOptionWidth + options.text.padding.x*2 + options.border.padding*2) :
                          (options.expanded.fallback.width) :
    (options.unexpanded.width));
  const [height, setHeight] = useState<number>((expanded) ?
    (fontOptionHeight>0) ? (fontOptionHeight + options.text.padding.y*2 + options.border.padding*2) :
                           (options.expanded.fallback.height) :
    (options.unexpanded.height));
  const [opacity, setOpacity] = useState<number>((expanded) ? 1 : 0.7);
  const [cornerRadiusPercentage, setCornerRadiusPercentage] = useState<number>((expanded) ? 0.1 : 0.5);

  const targetWidth = (expanded) ?
    (fontOptionWidth>0) ? (fontOptionWidth + options.text.padding.x*2 + options.border.padding*2) :
                          (options.expanded.fallback.width) :
    (options.unexpanded.width);
  const targetHeight = (expanded) ?
    (fontOptionHeight>0) ? (fontOptionHeight + options.text.padding.y*2 + options.border.padding*2) :
                           (options.expanded.fallback.height) :
    (options.unexpanded.height);
  const targetOpacity = (expanded) ? options.expanded.opacity : options.unexpanded.opacity;
  const targetCornerRadiusPercentage = (expanded) ? options.expanded.cornerRadiusPercentage : options.unexpanded.cornerRadiusPercentage;
  const animationRef = useRef(0);

  const fontOptionId = useRef(Date.now());

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
        setCornerRadiusPercentage(initialCornerRadiusPercentage + (targetCornerRadiusPercentage-initialCornerRadiusPercentage)*progress);
  
        if (progress < 1)
          animationRef.current = requestAnimationFrame(animate);
      }
  
      animationRef.current = requestAnimationFrame(animate);
  
      return () => cancelAnimationFrame(animationRef.current);
    }, [expanded, focusedOption, fontOptionWidth, fontOptionHeight, maxFontWidth,]);

  const handleMouseEnter = () => setExpanded(true);

  //const handleMouseLeave = () => setExpanded((focusedOption) ? true : false);
  const handleMouseLeave = () => setExpanded(true);


  const handleMouseDown = (e:any) => {
    if (focusedOption)
      e.preventDefault();

    e.stopPropagation();
  }

  const notifyFocused = (id:number, focused:boolean) => {
    setFocusedOption((focused) ? id : 0);
    if (!focused)
      setExpanded(false);
  }

  return (
    <div
      className="absolute"
      style={{
        left:left + "px",
        top:top + "px"
      }}>
    <svg
      width={width}
      height={height}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <rect
        width={width}
        height={height}
        fill='#ADD8E6'
        rx={width * cornerRadiusPercentage}
        ry={height * cornerRadiusPercentage}
        opacity={opacity}
        />
      {expanded &&
      <rect
          className="hover:fill-gray-200 hover:cursor-pointer hover:stroke-yellow-600"
          x={options.border.padding}
          y={options.border.padding}
          width={fontOptionWidth + options.text.padding.x*2}
          height={fontOptionHeight + options.text.padding.y*2}
          rx={fontOptionWidth*cornerRadiusPercentage}
          ry={fontOptionHeight*cornerRadiusPercentage}
          stroke={"black"}
          fill={'white'}>
        </rect>}
      {expanded &&
        <text
          className="cursor-pointer"
          x={options.border.padding + (fontOptionWidth + options.text.padding.x*2)/2 - fontOptionWidth/2}
          y={options.border.padding + (fontOptionHeight + options.text.padding.y*2)/2 + fontOptionHeight/2 - fontDims.textHeightGap}
          fontSize={fontSize}
          style={{
            pointerEvents:'none'
          }}>
          {font.name}
        </text>
      }
      {expanded &&
      <FontOption
        id={fontOptionId.current}
        x={options.border.padding}
        y={options.border.padding}
        labelWidth={width - options.border.padding*2}
        labelHeight={height - options.border.padding*2}
        cornerRadiusPercentage={cornerRadiusPercentage}
        font={font}
        fontSize={fontSize}
        availableFonts={availableFonts}
        maxFontWidth={maxFontWidth}
        notifyFontChange={notifyFontChange}
        notifyFocused={notifyFocused}/>
      }
    </svg>
    </div>
  );
}
