import { MouseEvent, MouseEventHandler, useEffect, useRef, useState } from "react";
import LeafFontSizeInput from '@/components/LeafFontSizeInput';
import useAnimation from "@/hooks/useAnimation";
import { Font, FontTb } from "@/hooks/useFont";
import { Leaf } from "@/hooks/useLeaves";
import LeafOptionsTabs from "./LeafOptionsTabs";

type LeafOptionsProps = {
  leaf:Leaf,
  x:number,
  y:number,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  expanded:boolean,
  systemFont:Font,
  systemFontSize:number,
  fontTb:FontTb,
  parentMouseEnter:MouseEventHandler<SVGSVGElement>,
  parentMouseLeave:MouseEventHandler<SVGSVGElement>,
}

const _ = {
  padding: {
    x: 5,
  },
  unexpanded: {
    size:10,
    opacity:0.7,
    cornerRadiusPercentage:0.5,
  },
  expanded: {
    width:80,
    height:40,
    opacity:1,
    cornerRadiusPercentage:0.1,
  },
  border: {
    padding: {
      x: 5,
      y: 5,
    }
  },
  text: {
    size:16,
    padding: {
      x: 5,
      y: 2,
    }
  },
  arrow: {
    horizontal: {
      padding: {
        x: 2,
        y: 2,
      }
    }
  },
  spacing: {
    x:5,
  }
}

export default function LeafOptions({
    leaf, x, y, notifyParentFocused, notifyChangeFontSize,
    expanded, systemFont, systemFontSize, fontTb, parentMouseEnter, parentMouseLeave} : LeafOptionsProps) {
  const displays = {
    fontSize:"fontSize",
  }

  const [displayed, setDisplayed] = useState<string[]>([displays.fontSize]);
  const isDisplayFontSize = (displayed.includes(displays.fontSize));
  const displayFontSize = () => setDisplayed([displays.fontSize]);

  let svgWidth = 0, svgHeight = 0;
  let tabsHeight = 0;
  let fontSizeInputWidth = 0, fontSizeInputHeight = 0;

  if (isDisplayFontSize) {
    const textDims = fontTb.getDims("< " + leaf.fontSize + " >", systemFont, systemFontSize);
    
    fontSizeInputWidth = textDims.width + _.arrow.horizontal.padding.x*2;
    fontSizeInputHeight = textDims.height + _.text.padding.y*2;
    tabsHeight = fontSizeInputHeight*0.5;

    svgWidth = _.border.padding.x*2 + fontSizeInputWidth;
    svgHeight = _.border.padding.y*2 + fontSizeInputHeight + tabsHeight;
  }


  return (<svg
      x={x - svgWidth - _.padding.x}
      y={y}
      width={svgWidth}
      height={svgHeight}>
    <rect
      width={svgWidth}
      height={svgHeight}
      rx={5}
      fill='#ADD8E6' />
    <LeafOptionsTabs 
      width={svgWidth}
      height={tabsHeight}
      systemFont={systemFont}
      systemFontSize={systemFontSize}
      fontTb={fontTb}
      />
    {(displayed[0] === displays.fontSize) &&
      <LeafFontSizeInput
        leaf={leaf}
        x={svgWidth*0.5 - fontSizeInputWidth/2}
        y={tabsHeight + (svgHeight-tabsHeight)/2 - fontSizeInputHeight/2}
        width={fontSizeInputWidth}
        height={fontSizeInputHeight}
        notifyParentFocused={notifyParentFocused}
        notifyChangeFontSize={notifyChangeFontSize}
        systemFont={systemFont}
        systemFontSize={systemFontSize}
        fontTb={fontTb}/>}
    </svg>);

  /*const [hovered, setHovered] = useState<string>("");

  const dims = fontTb.getDims("" + leaf.fontSize, systemFont, systemFontSize, x, y);

  console.log('dims!', dims);
  
  const getWidth = () => expanded ? dims.width + options. : options.unexpanded.size;
  const getHeight = () => expanded ? options.expanded.height : options.unexpanded.size;
  const getOpacity = () => expanded ? options.expanded.opacity : options.unexpanded.opacity;
  const getCornerRadiusPercentage = () => expanded ? 0.1 : 0.5;

  const [width, height, opacity, cornerRadiusPercentage] = useAnimation(
    [getWidth, getHeight, getOpacity, getCornerRadiusPercentage],
    [expanded]);

  const handleMouseDown = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
  }

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
  }

  const handleMouseEnter = (left:boolean) => {
    setHovered(left ? "left" : "right");
  }

  const handleMouseLeave = () => {
    setHovered("");
  }

  const handleArrowPressed = (e:React.MouseEvent<SVGSVGElement, MouseEvent>, left:boolean) => {
    e.stopPropagation();
    if (notifyChangeFontSize) notifyChangeFontSize(left ? leaf.fontSize-1 : leaf.fontSize+1);
  }

  return (
    <svg
      x={x - width - options.spacing.x}
      y={y - textHeight/2 - height/2}
      width={width}
      height={height}
      onMouseDown={(e:any) => handleMouseDown(e)}
      onMouseUp={(e:any) => handleMouseUp(e)}
      onMouseEnter={parentMouseEnter}
      onMouseLeave={parentMouseLeave}>
    <rect
      width={width}
      height={height}
      rx={cornerRadiusPercentage*width}
      ry={cornerRadiusPercentage*height}
      fill="#ADD8E6"
      fillOpacity={opacity}
      stroke="#F4F3FF"
      strokeWidth="1.5"
    />
    {expanded &&
    <rect
      x={2}
      y={5}
      width={20}
      height={height-10}
      rx={5}
      onMouseEnter={() => handleMouseEnter(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={(e:any) => handleArrowPressed(e, true)}
      style={{
        fill: (hovered === "left") ? "#DDDDDD" : "none",
        pointerEvents:"visible",
        cursor:"pointer",
      }}/>
    }
    {expanded &&
    <svg
      viewBox="0 0 150 300"
      x={2}
      y={10}
      width={15}
      height={height-20}>
      <path xmlns="http://www.w3.org/2000/svg"
        style={{
          pointerEvents:"none",
          fill:"none",
          stroke: (hovered === "left") ? "yellow" : "black",
          strokeWidth:30,
          strokeLinecap:"round",
          strokeLinejoin:"round",
          strokeDasharray:"none",
          strokeOpacity:1}} 
        d="M 129,21 21,150 129,279"/>
    </svg>
    }
    {expanded &&
    <rect
      x={width-23}
      y={5}
      width={20}
      height={height-10}
      rx={5}
      onMouseEnter={() => handleMouseEnter(false)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={(e:any) => handleArrowPressed(e, false)}
      style={{
        fill: (hovered === "right") ? "#DDDDDD" : "none",
        pointerEvents:"visible",
        cursor:"pointer",
      }}/>
    }
    {expanded &&
    <svg
      viewBox="0 0 150 300"
      x={width-18}
      y={10}
      width={15}
      height={height-20}>
      <path xmlns="http://www.w3.org/2000/svg"
        style={{
          pointerEvents:"none",
          fill:"none",
          stroke: (hovered === "right") ? "yellow" : "black",
          strokeWidth:30,
          strokeLinecap:"round",
          strokeLinejoin:"round",
          strokeDasharray:"none",
          strokeOpacity:1}} 
        d="M 21,21 129,150 21,279"/>
    </svg>
    }
    {expanded &&
    <LeafInput
      leaf={leaf}
      width={height-5}
      height={height-10}
      notifyParentFocused={notifyParentFocused}
      notifyChangeFontSize={notifyChangeFontSize}
      parentWidth={width}
      parentHeight={height}
      systemFont={systemFont}
      systemFontSize={systemFontSize}
      fontTb={fontTb}
      />
    }
    </svg>
  );*/
}