import { MouseEventHandler, useContext, useEffect, useState } from "react";
import FontSizeTab from '@/components/journalWriter/leaf/options/FontSizeTab';
import useAnimation from "@/hooks/useAnimation";
import { Leaf } from "@/hooks/useLeaves";
import Tabs from "./Tabs";
import { calcFontDims, Dimension, emptyDimension } from "@/hooks/useFonts";
import { useFontsContext, useSystemFontContext } from "../../JournalWriter";

type Props = {
  leaf:Leaf,
  x:number,
  y:number,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  expanded:boolean,
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

const Options:React.FC<Props> = ({
    leaf, x, y,
    notifyParentFocused, notifyChangeFontSize,
    expanded,
    parentMouseEnter, parentMouseLeave} : Props) => {
  const displays = {
    fontSize:"fontSize",
  }
  const systemFont = useSystemFontContext();
  const { loaded } = useFontsContext();
  const calcTextDims = () => calcFontDims("< " + _.font.maxSize + " >", systemFont, x, y);
  const [textDims, setTextDims] = useState<Dimension>(calcTextDims());
  const [displayed, setDisplayed] = useState<string[]>([displays.fontSize]);
  const isDisplayFontSize = (displayed.includes(displays.fontSize));
  const displayFontSize = () => setDisplayed([displays.fontSize]);

  let svgWidth = 0, svgHeight = 0;
  let tabsHeight = 0;
  let fontSizeInputWidth = 0, fontSizeInputHeight = 0;

  useEffect(() => {
    console.log('loaded: ', loaded);
    if (!loaded) return;

    setTextDims(calcTextDims());
  }, [loaded, systemFont])

  if (isDisplayFontSize) {
    // Use max font size so we don't have to change the size
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
      />
    {(displayed[0] === displays.fontSize) &&
      <FontSizeTab
        leaf={leaf}
        x={svgWidth*0.5 - fontSizeInputWidth/2}
        y={tabsHeight + (svgHeight-tabsHeight)/2 - (fontSizeInputHeight)/2}
        width={fontSizeInputWidth}
        height={fontSizeInputHeight}
        notifyParentFocused={notifyParentFocused}
        notifyChangeFontSize={notifyChangeFontSize}/>}
    </svg>);
}

export default Options;