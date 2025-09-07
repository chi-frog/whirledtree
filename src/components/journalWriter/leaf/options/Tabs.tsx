'use client'

import { Font, FontTb } from "@/hooks/useFont";
import { useState } from "react";
import ChangeFontSize from "./svg/ChangeFontSize";
import ChangeFont from "./svg/ChangeFont";
import ChangeFontSpecial from "./svg/ChangeFontSpecial";

const _ = {
  padding: {
    x:5,
    y:0,
  }
}

type Props = {
  width:number,
  height:number,
  systemFont:Font,
  systemFontSize:number,
  fontTb:FontTb,
}

const Tabs:React.FC<Props> = ({
    width, height, systemFont, systemFontSize, fontTb
    }:Props) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const rWidth = width - _.padding.x*2;
  const rHeight = height - _.padding.y*2;

  const tabWidth = rWidth/3;

  const tabs = (<>
    <rect
      className={selectedTab !== 0 ? "hover:fill-green-200 cursor-pointer" : ""}
      x={_.padding.x}
      y={-1}
      width={tabWidth}
      height={height + 2}
      fill='#ADD8E6'
      stroke='oklch(96.9% 0.015 12.422)'
      strokeWidth='1'/>
    <ChangeFontSize x={_.padding.x + 2} y={2} width={tabWidth-4} height={height - 4}/>
    <rect
      className={selectedTab !== 1 ? "hover:fill-green-200 cursor-pointer" : ""}
      x={_.padding.x + tabWidth}
      y={-1}
      width={tabWidth}
      height={height}
      fill='#ADD8E6'
      stroke='oklch(96.9% 0.015 12.422)'
      strokeWidth='1'/>
    <ChangeFont x={_.padding.x + tabWidth + 2} y={2} width={tabWidth-4} height={height - 4}/>
    <rect
      className={selectedTab !== 2 ? "hover:fill-green-200 cursor-pointer" : ""}
      x={_.padding.x + tabWidth*2}
      y={-1}
      width={tabWidth}
      height={height}
      fill='#ADD8E6'
      stroke='oklch(96.9% 0.015 12.422)'
      strokeWidth='1'/>
    <ChangeFontSpecial x={_.padding.x + tabWidth*2 + 2} y={2} width={tabWidth-4} height={height - 4}/>
    </>);

  return (<svg width={width} height={height}>
    <defs>
      <linearGradient id="lgrad" x1="100%" y1="50%" x2="0%" y2="50%">
        <stop offset="0" stopColor="black" />
        <stop offset="0.2" stopColor="white" />
        <stop offset="0.8" stopColor="white" />
        <stop offset="1" stopColor="black" />
      </linearGradient>
      <mask id="myMask" x="0" y="0" width={width} height={height} maskUnits="userSpaceOnUse">
        <rect x="0" y="0" width={width} height={height} fill="url(#lgrad)" />
      </mask>
    </defs>
    <g mask='url(#myMask)'>
      {tabs}
    </g>
  </svg>);
}

export default Tabs;