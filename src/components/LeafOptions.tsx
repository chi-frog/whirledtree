import { MouseEvent, MouseEventHandler, useEffect, useRef, useState } from "react";
import LeafInput from '@/components/LeafInput';

type LeafOptionsProps = {
  x:number,
  y:number,
  textHeight:number,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  expanded:boolean,
  fontSize:number,
  parentMouseEnter:MouseEventHandler<SVGSVGElement>,
  parentMouseLeave:MouseEventHandler<SVGSVGElement>,
}

const options = {
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
  text: {
    size:16,
  },
  spacing: {
    x:5,
  }
}

export default function LeafOptions({
    x, y, textHeight, notifyParentFocused, notifyChangeFontSize,
    expanded, fontSize, parentMouseEnter, parentMouseLeave} : LeafOptionsProps) {
  const [width, setWidth] = useState(expanded ? options.expanded.width : options.unexpanded.size);
  const [height, setHeight] = useState(expanded ? options.expanded.height : options.unexpanded.size);
  const [opacity, setOpacity] = useState(expanded ? options.expanded.opacity : options.unexpanded.opacity);
  const [hovered, setHovered] = useState<string>("");
  const [moveX, setMoveX] = useState(expanded ? 0 : 0);
  const [moveY, setMoveY] = useState(expanded ? 0 : 0);
  const [cornerRadiusPercentage, setCornerRadiusPercentage] = useState(expanded ? 0.1 : 0.5);
  const targetWidth = expanded ? options.expanded.width : options.unexpanded.size;
  const targetHeight = expanded ? options.expanded.height : options.unexpanded.size;
  const targetOpacity = expanded ? options.expanded.opacity : options.unexpanded.opacity;
  const targetCornerRadiusPercentage = expanded ? options.expanded.cornerRadiusPercentage : options.unexpanded.cornerRadiusPercentage;
  const animationRef = useRef(0);

  var nextId = Date.now();
  function getNextId() {
    return nextId++;
  }
  
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
  }, [expanded]);

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
    if (notifyChangeFontSize) notifyChangeFontSize(left ? fontSize-1 : fontSize+1);
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
      id={getNextId()}
      x={x - width - options.spacing.x}
      y={y - textHeight/2 - height/2}
      width={height-5}
      height={height-10}
      notifyParentFocused={notifyParentFocused}
      notifyChangeFontSize={notifyChangeFontSize}
      parentWidth={width}
      parentHeight={height}
      leafFontSize={fontSize}
      fontSize={options.text.size}
      />
    }
    </svg>
  );
}