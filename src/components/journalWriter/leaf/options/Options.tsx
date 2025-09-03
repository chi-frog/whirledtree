import { MouseEventHandler, useState } from "react";
import FontSizeTab from '@/components/journalWriter/leaf/options/FontSizeTab';
import useAnimation from "@/hooks/useAnimation";
import { Font, FontTb } from "@/hooks/useFont";
import { Leaf } from "@/hooks/useLeaves";
import Tabs from "./Tabs";

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
  },
  font: {
    maxSize: 1638
  }
}

export default function LeafOptions({
    leaf, x, y,
    notifyParentFocused, notifyChangeFontSize,
    expanded, systemFont, systemFontSize, fontTb,
    parentMouseEnter, parentMouseLeave} : LeafOptionsProps) {
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
    // Use max font size so we don't have to change the size
    const textDims = fontTb.getDims("< " + _.font.maxSize + " >", systemFont, systemFontSize);

    fontSizeInputWidth = textDims.width + _.arrow.horizontal.padding.x*2;
    fontSizeInputHeight = textDims.height + _.text.padding.y*2;
    tabsHeight = fontSizeInputHeight*0.5;

    svgWidth = _.border.padding.x*2 + fontSizeInputWidth;
    svgHeight = _.border.padding.y*2 + fontSizeInputHeight + tabsHeight;
  }


  return (<svg
      x={x - svgWidth - _.padding.x}
      y={y - svgHeight}
      width={svgWidth}
      height={svgHeight}>
    <rect
      y={tabsHeight}
      width={svgWidth}
      height={fontSizeInputHeight + _.border.padding.y*2}
      rx={5}
      fill='#ADD8E6' />
    <Tabs 
      width={svgWidth}
      height={tabsHeight}
      systemFont={systemFont}
      systemFontSize={systemFontSize}
      fontTb={fontTb}
      />
    {(displayed[0] === displays.fontSize) &&
      <FontSizeTab
        leaf={leaf}
        x={svgWidth*0.5 - fontSizeInputWidth/2}
        y={tabsHeight + (svgHeight-tabsHeight)/2 - (fontSizeInputHeight)/2}
        width={fontSizeInputWidth}
        height={fontSizeInputHeight}
        notifyParentFocused={notifyParentFocused}
        notifyChangeFontSize={notifyChangeFontSize}
        systemFont={systemFont}
        systemFontSize={systemFontSize}
        fontTb={fontTb}/>}
    </svg>);
}