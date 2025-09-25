import { useState } from "react";
import FontSizeTab from '@/components/journalWriter/leaf/options/FontSizeTab';
import useAnimation from "@/hooks/useAnimation";
import { Leaf } from "@/hooks/useLeaves";
import Tabs from "./Tabs";

let _:any = {};

_.padding = {
  x: 5,
  y: 0,};

_.tab = {
  width: 60,
  height: 20,
  padding: {
    x:5,
    y:5,},
  opacity: 1,
  cornerRadiusPercentage:0.1};

_.tab.offset = {
  x: _.tab.padding.x,
  y: _.tab.padding.y,};

_.nav = {
  width: _.tab.width + _.tab.padding.x*2,
  height: 15,};

_.svg = {
  width: _.tab.padding.x*2 + _.tab.width,
  height: _.tab.padding.y*2 + _.tab.height + _.nav.height,};

_.svg.offset = {
    x: _.padding.x + _.svg.width,
    y: _.padding.y + _.svg.height,};

_.unexpanded = {
  width: 10,
  height: 10,
  opacity: 0.7,
  cornerRadiusPercentage:0.5,};

_.unexpanded.offset = {
    x: _.padding.x + _.unexpanded.width,
    y: _.padding.y + _.unexpanded.height,};

_.arrow = {
  horizontal: {
    padding: {
      x:2,
      y:2,},},};

_.font = {
  maxSize: 1638,};

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
  const [displayed, setDisplayed] = useState<string[]>([displays.fontSize]);
  const isDisplayFontSize = (displayed.includes(displays.fontSize));
  const displayFontSize = () => setDisplayed([displays.fontSize]);

  const handleMouseEnter = () => parentMouseEnter();
  const handleMouseLeave = () => parentMouseLeave();

  const getRectWidth = () =>
    (!expanded) ?
      _.unexpanded.width :
      _.svg.width;
  const getRectHeight = () =>
    (!expanded) ?
      _.unexpanded.height :
      _.tab.height + _.tab.padding.y*2;

  const getTabWidth = () =>
    (!expanded) ?
      _.unexpanded.width :
      _.tab.width;
  const getTabHeight = () =>
    (!expanded) ?
      _.unexpanded.height :
      _.tab.height;

  const getNavWidth = () =>
    (!expanded) ?
      0 :
      _.nav.width;
  const getNavHeight = () =>
    (!expanded) ?
      0 :
      _.nav.height;

  const [rectWidth, rectHeight,
         tabWidth, tabHeight,
         navWidth, navHeight] = useAnimation(
    [getRectWidth, getRectHeight,
     getTabWidth,  getTabHeight,
     getNavWidth,  getNavHeight],
    [expanded]);

  const rectX = _.svg.width - rectWidth;
  const rectY = _.svg.height - rectHeight;
  const rectCornerRadius = (!expanded) ?
    _.unexpanded.width*_.unexpanded.cornerRadiusPercentage :
    tabHeight*_.tab.cornerRadiusPercentage;

  const tabX = _.svg.width - tabWidth - _.tab.padding.x;
  const tabY = _.svg.height - tabHeight - _.tab.padding.y;

  const tabsX = _.svg.width - navWidth;
  const tabsY = _.nav.height - navHeight;

  console.log('x:' + tabsX + " y:" + tabsY);

  const svgX = x - _.svg.offset.x;
  const svgY = y - _.svg.offset.y;
  const svgWidth = _.svg.width;
  const svgHeight = _.svg.height;

  return (<svg
      x={svgX}
      y={svgY}
      width={svgWidth}
      height={svgHeight}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
    <rect
      x={rectX}
      y={rectY}
      width={rectWidth}
      height={rectHeight}
      rx={rectCornerRadius}
      fill='#ADD8E6'
      onMouseDown={(e)=>e.stopPropagation()}/>
    {(expanded) &&
    <Tabs
      x={tabsX}
      y={tabsY}
      width={navWidth}
      height={navHeight}
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