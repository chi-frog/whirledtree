'use client'

import { useEffect, useRef, useState } from "react";

type Node = {
  content:string,
  color:string,
  hoverColor:string,
}

type Props = {
  x:number,
  y:number,
  width:number,
  height:number,
}

const defaultNodes:Node[] = [
  {content:'yellow', color:'#ffff00', hoverColor:'#888800'},
  {content:'orange', color:'#ffaf00', hoverColor:'#884800'},
  {content:'red', color:'#ff0000', hoverColor:'#880000'},
  {content:'blue', color:'#0000ff', hoverColor:'#000088'},
  {content:'green', color:'#00ff00', hoverColor:'#008800'},
  {content:'purple', color:'#ff00ff', hoverColor:'#880088'},
  {content:'brown', color:'#964b00', hoverColor:'#432500'},
];

const _ = {
  visibleNodeCount:5,
}

const Scroller:React.FC<Props> = ({x, y, width, height}:Props) => {
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [scrollingOffset, setScrollingOffset] = useState<number>(0);
  const [scrolling, setScrolling] = useState<boolean>(false);
  const [scrollingStart, setScrollingStart] = useState<number>(0);
  const [scrollOverflow, setScrollOverflow] = useState<number>(0);
  const animationRef = useRef(0);

  const nodeWidth = (width - 20);
  const nodeHeight = (height/_.visibleNodeCount);
  const totalHeight = nodeHeight*nodes.length;
  const scrollerHeight = (height/totalHeight)*height;

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

      setScrollPosition(initialScrollPosition - initialScrollOverflow*progress);
 
      if (progress < 1)
        animationRef.current = requestAnimationFrame(animate);
      else
        setScrollOverflow(0);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [scrollOverflow]);

  /*console.log`Hello`; // [ 'Hello' ]
  console.log.bind(1, 2)`Hello`; // 2 [ 'Hello' ]
  new Function("console.log(arguments)")`Hello`; // [Arguments] { '0': [ 'Hello' ] }*/

  const stopScrolling = () => {
    if (!scrolling) return;

    setScrolling(false);

    if (scrollPosition < 0) setScrollOverflow(scrollPosition);
    if (scrollPosition > (totalHeight - height)) setScrollOverflow(scrollPosition - (totalHeight - height));
  }

  const onMouseEnter = (index:number) => setHoveredIndex(index);

  const onMouseLeave = () => {
    if (hoveredIndex !== -1) setHoveredIndex(-1);
  };

  const nodeOnMouseDown = (index:number) => console.log('Number ' + index + ' clicked.');
  
  const scrollerOnMouseDown:React.MouseEventHandler = (e) => {
    setScrollingOffset(e.clientY);
    setScrollingStart(scrollPosition);
    setScrolling(true);
  };

  const scrollerOnMouseMove:React.MouseEventHandler = (e) => {
    if (!scrolling) return;

    const position = (e.clientY - scrollingOffset);

    setScrollPosition(scrollingStart + (totalHeight/height)*position);
  }

  const nodesJSX = nodes.map((_node, _index) => (
      <rect className='cursor-pointer'
        key={_index}
        x={5}
        y={_index*nodeHeight - scrollPosition}
        width={nodeWidth}
        height={nodeHeight}
        filter={(hoveredIndex === _index) ? 'brightness(85%)' : ''}
        fill={_node.color}
        onMouseEnter={() => onMouseEnter(_index)}
        onMouseLeave={onMouseLeave}
        onMouseDown={() => nodeOnMouseDown(_index)}/>
    ));

  const lowerShadowHeight = 10 - 10*scrollPosition/(totalHeight-height);
  const upperShadowHeight = 10*scrollPosition/(totalHeight - height);

  return (<svg className="w-screen h-screen"> <svg x={x} y={y} width={width} height={height}>
    <defs>
      <linearGradient id="upper" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0" stopColor="white" />
        <stop offset="1" stopColor="black" />
      </linearGradient>
      <linearGradient id="lower" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0" stopColor="black" />
        <stop offset="1" stopColor="white" />
      </linearGradient>
      <mask id="both" x="0" y="0" width={width} height={height} maskUnits="userSpaceOnUse">
        <rect x="0" y="0" width={width} height={upperShadowHeight} fill="url(#upper)" />
        <rect x="0" y={upperShadowHeight} width={width} height={height-upperShadowHeight-lowerShadowHeight} fill="white" />
        <rect x="0" y={height-lowerShadowHeight} width={width} height={lowerShadowHeight} fill="url(#lower)" />
      </mask>
      <mask id="bottom" x="0" y="0" width={width} height={height} maskUnits="userSpaceOnUse">
        <rect x="0" y="0" width={width} height={height-lowerShadowHeight} fill="white" />
        <rect x="0" y={height-lowerShadowHeight} width={width} height={lowerShadowHeight} fill="url(#lower)" />
      </mask>
      <mask id="top" x="0" y="0" width={width} height={height} maskUnits="userSpaceOnUse">
        <rect x="0" y="0" width={width} height={upperShadowHeight} fill="url(#upper)" />
        <rect x="0" y={upperShadowHeight} width={width} height={height-upperShadowHeight} fill="white" />
      </mask>
    </defs>
    <rect
      width={width}
      height={height}
      fill='white'/>
    <g mask={(scrollPosition <= 0) ? 'url(#bottom)' :
             (scrollPosition >= (totalHeight - height)) ? 'url(#top)' :
              'url(#both)'}>
      {...nodesJSX}
    </g>
    <rect className="cursor-pointer hover:fill-gray-400"
      x={10 + nodeWidth}
      y={(height/totalHeight)*scrollPosition}
      width={10}
      height={scrollerHeight}
      fill='grey'
      onMouseDown={(e) => scrollerOnMouseDown(e)}
      onMouseUp={stopScrolling}
      onMouseLeave={stopScrolling}
      onMouseMove={(e) => scrollerOnMouseMove(e)}/>
  </svg></svg>);
};

export default Scroller;