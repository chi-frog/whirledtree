import { useEffect, useState } from "react";
import FontSizeTab from '@/components/journalWriter/leaf/options/FontSizeTab';
import useAnimation from "@/hooks/useAnimation";
import { Leaf } from "@/hooks/useLeaves";
import Tabs from "./Tabs";
import { calcFontDims, Dimension } from "@/hooks/useFonts";
import { useFontsContext, useSystemFontContext } from "../../JournalWriter";

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
};

type Props = {
  leaf:Leaf,
  x:number,
  y:number,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  expanded:boolean,
  parentMouseEnter:()=>any,
  parentMouseLeave:()=>any,
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

  let svgX = 0, svgY = 0, svgWidth = 0, svgHeight = 0;
  let rectHeight = 0, cornerRadiusX = 0, cornerRadiusY = 0;
  let tabsHeight = 0;
  let tabX = 0, tabY = 0, getTabWidth:()=>number, getTabHeight:()=>number;

  useEffect(() => {
    if (!loaded) return;

    setTextDims(calcTextDims());
  }, [loaded, systemFont]);

  const handleMouseEnter = () => parentMouseEnter();
  const handleMouseLeave = () => parentMouseLeave();

  getTabWidth = () =>
    (!expanded) ? _.unexpanded.size :
                  textDims.width + _.arrow.horizontal.padding.x*2;
  getTabHeight = () =>
    (!expanded) ?
      _.unexpanded.size :
      textDims.height + _.text.padding.y*2;

  const [tabWidth, tabHeight] = useAnimation(
    [getTabWidth, getTabHeight],
    [expanded]);

  tabsHeight =
    (!expanded) ?
      0 :
      Math.min(tabHeight*0.5, 50);

  svgWidth = _.border.padding.x*2 + tabWidth;
  svgHeight = _.border.padding.y*2 + tabHeight + tabsHeight;
  rectHeight = tabHeight + _.border.padding.y*2;

  svgX = x - svgWidth - _.padding.x;
  svgY = y - svgHeight;
  tabX = svgWidth*0.5 - tabWidth/2;
  tabY = tabsHeight + (svgHeight-tabsHeight)/2 - tabHeight/2;
  
  cornerRadiusX =
    (!expanded) ?
      svgWidth*_.unexpanded.cornerRadiusPercentage :
      svgWidth*_.expanded.cornerRadiusPercentage;
  cornerRadiusY =
    (!expanded) ?
      rectHeight*_.unexpanded.cornerRadiusPercentage :
      rectHeight*_.expanded.cornerRadiusPercentage;

  return (<svg
      x={svgX}
      y={svgY}
      width={svgWidth}
      height={svgHeight}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      >
    <rect
      y={tabsHeight}
      width={svgWidth}
      height={rectHeight}
      rx={cornerRadiusX}
      ry={cornerRadiusY}
      fill='#ADD8E6' />
    {(expanded) &&
    <Tabs 
      width={svgWidth}
      height={tabsHeight}
      />
    }
    {(displayed[0] === displays.fontSize) &&
     (expanded) &&
      <FontSizeTab
        leaf={leaf}
        x={tabX}
        y={tabY}
        width={tabWidth}
        height={tabHeight}
        notifyParentFocused={notifyParentFocused}
        notifyChangeFontSize={notifyChangeFontSize}/>}
    </svg>);
}

export default Options;