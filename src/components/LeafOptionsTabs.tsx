'use client'

import { Font, FontTb } from "@/hooks/useFont";

const _ = {
  padding: {
    x:2,
    y:2,
  }
}

type Props = {
  width:number,
  height:number,
  systemFont:Font,
  systemFontSize:number,
  fontTb:FontTb,
}

const LeafOptionsTabs:React.FC<Props> = ({
    width, height, systemFont, systemFontSize, fontTb
    }:Props) => {



  return (<g>
    <defs>
      <linearGradient id="lgrad" x1="100%" y1="50%" x2="0%" y2="50%">
        <stop offset="0" stopColor="black" />
        <stop offset="0.1" stopColor="white" />
        <stop offset="0.9" stopColor="white" />
        <stop offset="1" stopColor="black" />
      </linearGradient>
      <mask id="myMask" x="0" y="0" width="100%" height="100%">
        <rect x="0" y="0" width="100%" height="100%" fill="url(#lgrad)" />
      </mask>
    </defs>
    <rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill="white"
      mask='url(#myMask)'/>
  </g>);
}

export default LeafOptionsTabs;