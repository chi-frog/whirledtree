'use client'

import { MouseEventHandler, useEffect, useRef, useState } from "react";
import TextBox from "../journalWriter/svg/TextBox";
import { Font } from "@/hooks/useFonts";
import { ScrollFunc, ScrollStartFunc, useScrollContext } from "@/app/page";

type Props = {
  x:number,
  y:number,
  width:number,
  height:number,
  font:Font,
  labels:string[],
  onClickHandlers:MouseEventHandler[],
}

const _ = {
  visibleNodeCount:5,
}

const Scroller:React.FC<Props> = ({x, y, width, height, font, labels, onClickHandlers}:Props) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [scrollOverflow, setScrollOverflow] = useState<number>(0);
  const animationRef = useRef(0);

  const nodesHeight = (height > 10) ? height - 10 : 0;
  const nodeWidth = width - 15;
  const nodeHeight = (nodesHeight/_.visibleNodeCount);
  const totalHeight = nodeHeight*labels.length;
  const leftoverHeight = totalHeight - nodesHeight;
  const heightRatio = (totalHeight === 0) ? 0 : (nodesHeight/totalHeight);
  const heightRatioRev = (nodesHeight === 0) ? 0 : (totalHeight/nodesHeight);
  const scrollerHeight = heightRatio*nodesHeight;

  const ref = useRef<SVGSVGElement>(null);
  const offset = useRef<number>(0);
  const start = useRef<number>(0);
  const position = useRef<number>(0);

  const {subScroll, scrollOn, scrolling} = useScrollContext();

  const setPosition = (newPosition:number) => {
    setScrollPosition(newPosition);
    position.current = newPosition;
  };

  const onScrollStart:ScrollStartFunc = (e) => {
    offset.current = e.clientY;
    start.current = position.current;
    console.log('SET offset:' + e.clientY + " start:" + position.current);
  }

  const onScroll:ScrollFunc = (e) => {
    console.log('onScroll (' + e.clientY + ', ' + offset.current + ', ' + start.current + ")");

    const newPosition = start.current + (e.clientY - offset.current)*heightRatioRev;
    setPosition(newPosition);
  };

  const onScrollEnd:ScrollFunc = (e) => {
    const endPosition = start.current + (e.clientY - offset.current)*heightRatioRev;

    console.log('scrollPosition:', endPosition);
    setPosition(endPosition);
    if (endPosition < 0) setScrollOverflow(endPosition);
    if (endPosition > leftoverHeight) setScrollOverflow(endPosition - leftoverHeight);
  }

  useEffect(() => {
    if (height !== 0)
      subScroll({tag:'scroller', onScrollStart, onScroll, onScrollEnd});
  }, [height]);

  useEffect(() => {
    if (scrollOverflow === 0) return;

    cancelAnimationFrame(animationRef.current);

    let start:number;
    const duration = 100;
    const initialScrollPosition = scrollPosition;
    const initialScrollOverflow = scrollOverflow;

    function animate(time:number) {
      if (!start) start = time;

      const progress = Math.min((time - start)/duration, 1);

      setPosition(initialScrollPosition - initialScrollOverflow*progress);
 
      if (progress < 1)
        animationRef.current = requestAnimationFrame(animate);
      else
        setScrollOverflow(0);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [scrollOverflow]);

  const onMouseEnter = (index:number) => {
    setHoveredIndex(index);
  };

  const onMouseLeave = () => {
    if (hoveredIndex !== -1) setHoveredIndex(-1);
  };
  
  const scrollerOnMouseDown:React.MouseEventHandler = (e) => {
    scrollOn(e);
  };

  const nodesJSX = labels.map((_label, _index) => (
    <TextBox
      key={_index}
      x={5}
      y={5 + _index*nodeHeight - scrollPosition}
      width={nodeWidth}
      height={nodeHeight}
      text={_label}
      shouldFitText={true}
      scrolling={scrolling}
      font={font}
      onMouseEnter={() => {onMouseEnter(_index)}}
      onMouseLeave={onMouseLeave}
      onMouseDown={onClickHandlers[_index]}/>
  ));

  const lowerShadowHeight = (leftoverHeight === 0) ? 0 :
    10 - 10*scrollPosition/leftoverHeight;
  const upperShadowHeight = (leftoverHeight === 0) ? 0 :
    10*scrollPosition/leftoverHeight;

  return (<svg ref={ref} x={x} y={y} width={width} height={height}>
    <defs>
      <linearGradient id="upper" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0" stopColor="white" />
        <stop offset="1" stopColor="black" />
      </linearGradient>
      <linearGradient id="lower" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0" stopColor="black" />
        <stop offset="1" stopColor="white" />
      </linearGradient>
      <mask id="both" x="0" y="5" width={width} height={nodesHeight} maskUnits="userSpaceOnUse">
        <rect x="0" y="5" width={width} height={upperShadowHeight} fill="url(#upper)" />
        <rect x="0" y={5 + upperShadowHeight} width={width} height={nodesHeight-upperShadowHeight-lowerShadowHeight} fill="white" />
        <rect x="0" y={5 + nodesHeight-lowerShadowHeight} width={width} height={lowerShadowHeight} fill="url(#lower)" />
      </mask>
      <mask id="bottom" x="0" y="5" width={width} height={nodesHeight} maskUnits="userSpaceOnUse">
        <rect x="0" y="5" width={width} height={nodesHeight-lowerShadowHeight} fill="white" />
        <rect x="0" y={5 + nodesHeight-lowerShadowHeight} width={width} height={lowerShadowHeight} fill="url(#lower)" />
      </mask>
      <mask id="top" x="0" y="5" width={width} height={nodesHeight} maskUnits="userSpaceOnUse">
        <rect x="0" y="5" width={width} height={upperShadowHeight} fill="url(#upper)" />
        <rect x="0" y={5 + upperShadowHeight} width={width} height={nodesHeight-upperShadowHeight} fill="white" />
      </mask>
    </defs>
    <rect
      width={width}
      height={height}
      rx={5}
      fill='#ADD8E6'/>
    <g mask={(scrollPosition <= 0) ? 'url(#bottom)' :
             (scrollPosition >= leftoverHeight) ? 'url(#top)' :
              'url(#both)'}>
      {...nodesJSX.filter((_node, _index) => _index !== hoveredIndex)}
    </g>
    <rect
      className={
        (!scrolling) ? "cursor-pointer fill-gray-300 hover:fill-gray-400" :
                       "cursor-grabbing fill-gray-400"}
      x={5 + nodeWidth}
      y={5 + heightRatio*scrollPosition}
      width={10}
      rx={3}
      height={scrollerHeight}
      onMouseDown={(e) => scrollerOnMouseDown(e)}
      style={{
        filter: (scrolling) ? 'drop-shadow( 3px 3px 2px rgba(0, 255, 0, .7))' : ''
      }}/>
    {nodesJSX[hoveredIndex]}
  </svg>);
};

export default Scroller;