'use client'

import { useEffect, useRef, useState } from "react";

export type Dimension = {
  width:number,
  height:number,
  textHeight:number,
  textHeightGap:number,
}

export type Font = {
  name:string,
  dimsMap:Map<number, Dimension>, // Map the dimensions per font size requested,
  getDims:(fontSize:number)=>Dimension,
  loaded:boolean,
}

const createDimension = ({width, height, textHeight, textHeightGap}:Dimension={width:0, height:0, textHeight:0, textHeightGap:0}) =>
  ({width, height, textHeight, textHeightGap});
const getDims = (dimsMap:Map<number, Dimension>, fontSize:number) => {
  const result = dimsMap.get(fontSize);
  return result ? result : createDimension();
};
const createFont:(name:string)=>Font = (name:string) => {
  const dimsMap = new Map<number, Dimension>();
  return {name:name, dimsMap, getDims:getDims.bind(null, dimsMap), loaded:false}};
const copyFont = (font:Font) => {
  const dimsMap = new Map<number, Dimension>();
  return {...font, dimsMap:new Map(font.dimsMap), getDims:getDims.bind(null, dimsMap)}};

const defaultFontNames = [
  "Aharoni", "Arial", "Helvetica", "Times New Roman", "Georgia",
  "Roboto", "Times",
]

const defaultFonts = defaultFontNames.map((_name) => createFont(_name));

function useFont(defaultFontName:string="Arial", defaultFontSize:number=16) {
  const [unloadedFonts, setUnloadedFonts] = useState<Font[]>(defaultFonts);
  const [loadedFonts, setLoadedFonts] = useState<Font[]>([]);
  const [font, setFont] = useState<Font>(loadedFonts.find((_font:Font) => (_font.name === defaultFontName)) ?? createFont(defaultFontName));
  const [fontSize, setFontSize] = useState<number>(defaultFontSize);
  const [maxWidth, setMaxWidth] = useState<number>(0);
  const loaded = useRef<boolean>(false);

  useEffect(() => {
    let newMaxWidth = maxWidth;

    if ((unloadedFonts.length > 0) || (getDims(loadedFonts[0].dimsMap, fontSize).width === 0)) {
      let loadedFonts =
        unloadedFonts.map((_font) => copyFont(_font)).
          filter((_font) => isFontAvailable(_font));

      loadedFonts.forEach((_font) => {
        const bbox = getTextBBox(_font.name, _font, fontSize, 0, 0);

        if (bbox.width > newMaxWidth) newMaxWidth = bbox.width;
        _font.dimsMap.set(fontSize, createDimension({width: bbox.width,
                                                     height: bbox.height,
                                                     textHeight: bbox.height - (((bbox.y + bbox.height)) * 2),
                                                     textHeightGap: (bbox.y + bbox.height)}));
        _font.getDims = getDims.bind(null, _font.dimsMap);
        _font.loaded = true;

        if (font.name === _font.name) {
          // Reset font as well.
          setFont(_font);
        }
      });
      console.log('loadedFonts', loadedFonts);
      setLoadedFonts(loadedFonts);
      setUnloadedFonts([]);
    }
    
    setMaxWidth(newMaxWidth);
    loaded.current = true;

    return () => {loaded.current = false};
  }, [unloadedFonts, fontSize]);

  function isFontAvailable(font:Font): boolean {
    const fontName = font.name;
    const testString = "mmmmmmmmmmlli";
    const testSize = "72px";

    const defaultFonts = ["monospace", "sans-serif", "serif"];
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) return false;

    canvas.width = 1000;
    canvas.height = 100;

    // Get width for each default font
    const baselineWidths = defaultFonts.map(baseFont => {
      context.font = `${testSize} ${baseFont}`;
      return context.measureText(testString).width;
    });

    // Measure with the target font + fallback
    return defaultFonts.some((baseFont, i) => {
      context.font = `${testSize} '${fontName}', ${baseFont}`;
      const width = context.measureText(testString).width;
      return width !== baselineWidths[i]; // If different, font is likely available
    });
  }

  const SVG_NS = "http://www.w3.org/2000/svg";

  function getTextBBox(content:string, font:Font, fontSize:number, x?:number, y?:number) {
    let fontSizeTest = document.createElementNS(SVG_NS, "text");
    fontSizeTest.setAttribute('font-size', "" + fontSize);
    fontSizeTest.setAttribute("font-family", font.name);
    fontSizeTest.setAttribute('style', "visibility:hidden;");
    if (x) fontSizeTest.setAttribute('x', "" + x);
    if (y) fontSizeTest.setAttribute('y', "" + y);
    fontSizeTest.textContent = content;
    let canvas = document.querySelector("#canvas");
    let bboxTest;

    if (canvas) {
      canvas.appendChild(fontSizeTest);
      bboxTest = fontSizeTest.getBBox();
      fontSizeTest.remove();
    } else
      bboxTest = {x:0, y:0, width:0, height:0};

    return bboxTest;
  }

  return {font, setFont, fontSize, loadedFonts, maxWidth};
}

export default useFont;