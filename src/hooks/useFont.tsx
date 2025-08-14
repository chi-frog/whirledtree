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
  console.log('dimsMap - getDims', dimsMap);
  return result ? result : createDimension();
};
const createFont:(name:string)=>Font = (name:string) => {
  const dimsMap = new Map<number, Dimension>();
  console.log('name - createFont', name);
  return {name:name, dimsMap, getDims:getDims.bind(null, dimsMap), loaded:false}};
const copyFont = (font:Font) => {
  const dimsMap = new Map<number, Dimension>();
  return {...font, dimsMap:new Map(font.dimsMap), getDims:getDims.bind(null, dimsMap)}};

const defaultFonts = [
  createFont("Aharoni"),
  createFont("Arial"),
  createFont("Helvetica"),
];

function useFont(defaultFontName:string="Arial", defaultFontSize:number=16) {
  const [unloadedFonts, setUnloadedFonts] = useState<Font[]>(defaultFonts);
  const [loadedFonts, setLoadedFonts] = useState<Font[]>([]);
  const [font, setFont] = useState<Font>(loadedFonts.find((_font:Font) => (_font.name === defaultFontName)) ?? createFont(defaultFontName));
  const [fontSize, setFontSize] = useState<number>(defaultFontSize);
  const [maxWidth, setMaxWidth] = useState<number>(0);
  const loaded = useRef<boolean>(false);

  useEffect(() => {
    let newMaxWidth = maxWidth;
    console.log('attempting font measurement');

    if ((unloadedFonts.length > 0) || (getDims(loadedFonts[0].dimsMap, fontSize).width === 0)) {
      const loadedFonts = unloadedFonts.map((_font) => copyFont(_font));
      console.log('carrying out font measurement');

      loadedFonts.forEach((_font) => {
        const bbox = getTextBBox(_font.name, fontSize, 0, 0);

        if (bbox.width > maxWidth) newMaxWidth = bbox.width;
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
      console.log('unloadedFonts', unloadedFonts);

      setLoadedFonts(loadedFonts);
      setUnloadedFonts([]);
    }

    setMaxWidth(newMaxWidth);
    loaded.current = true;

    return () => {loaded.current = false};
  }, [unloadedFonts, fontSize]);

  function isFontAvailable(font: string): boolean {
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
      context.font = `${testSize} '${font}', ${baseFont}`;
      const width = context.measureText(testString).width;
      return width !== baselineWidths[i]; // If different, font is likely available
    });
  }

  const SVG_NS = "http://www.w3.org/2000/svg";

  function getTextBBox(content:string, fontSize:number, x?:number, y?:number) {
    let fontSizeTest = document.createElementNS(SVG_NS, "text");
    fontSizeTest.setAttribute('font-size', "" + fontSize);
    fontSizeTest.setAttribute("font-family", "Arial");
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

  return {font, fontSize, loadedFonts, maxWidth};
}

export default useFont;