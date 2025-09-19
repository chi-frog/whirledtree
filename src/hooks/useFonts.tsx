'use client'

import { useEffect, useState } from "react";

const _ = {
  font: {
    defaultSize: 16,
    defaultName: "Arial",
  },
  svg: {
    canvasId: "#canvas",
  }
};

const SVG_NS = "http://www.w3.org/2000/svg";

const getTextBBox = (content:string, font:Font, x?:number, y?:number) => {
  let el;
   
  try {
    el = document.createElementNS(SVG_NS, "text");
  } catch {
    return {x:0, y:0, width:0, height:0};
  }

  el.setAttribute('font-size', "" + font.size);
  el.setAttribute("font-family", font.name);
  el.setAttribute('style', 'visibility:hidden;');
  el.setAttribute('style', 'whitespace:preserve')
  if (x) el.setAttribute('x', '' + x);
  if (y) el.setAttribute('y', '' + y);
  el.textContent = content;
  let canvas = document.querySelector(_.svg.canvasId);
  let bbox;

  if (canvas) {
    canvas.appendChild(el);
    bbox = el.getBBox();
    bbox.width = Math.max(bbox.width, el.getComputedTextLength());
    el.remove();
  } else
    bbox = {x:0, y:0, width:0, height:0};

    return bbox;
  };

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

export type Dimension = {
  width:number,
  height:number,
  textHeight:number,
  textHeightGap:number,
}

export type Font = {
  name:string,
  size:number,
}

type CreateDimension =
  ({width, height, textHeight, textHeightGap}:Dimension)=>Dimension;

type CreateFont =
  (name?:string)=>Font

export type FindFont = (name?:string)=>Font;

export type CalcFontDims =
  (content:string, font?:Font, x?:number, y?:number)=>Dimension;

export type CalcMaxFontsWidth =
  (trans:(_font:Font)=>string, fonts:Font[])=>number;

export type Fonts = {
  find:(name?:string)=>Font
  all:Font[],
  loaded:boolean,
}

export const nullFont = {
  name:"",
  size:0,
  dims:null,
};
export const emptyDimension = {
  width:0,
  height:0,
  textHeight:0,
  textHeightGap:0,
}

const createDimension:CreateDimension = ({width, height, textHeight, textHeightGap}={width:0, height:0, textHeight:0, textHeightGap:0}) =>
  ({width, height, textHeight, textHeightGap});
const createFont:CreateFont = (name=_.font.defaultName) =>
  ({name, size: _.font.defaultSize, dims:null});
const copyFont = (font:Font) => ({...font});

const defaultFontNames = [
  "Aharoni", "Arial", "Helvetica", "Times New Roman", "Georgia",
  "Roboto", "Times",
];

export const calcFontDims:CalcFontDims =
    (content, font, x, y) => {
  if (!font) font = nullFont;

  const bbox = getTextBBox(content, font, x, y);

  return createDimension({width: bbox.width,
                          height:bbox.height,
                          textHeight:bbox.height - ((bbox.y + bbox.height)*2),
                          textHeightGap: bbox.y + bbox.height});
};

export const calcMaxFontsWidth:CalcMaxFontsWidth = (trans, fonts) => {
  if (!fonts) return 0;

  let maxWidth = 0;

  fonts.forEach((_font) => {
    const {width} = calcFontDims(trans(_font), _font);
    if ((width > maxWidth))
      maxWidth = width;
  });
  
  return maxWidth;
};

const defaultFonts = defaultFontNames.map((_name) => createFont(_name));

const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [unloadedFonts, setUnloadedFonts] = useState<Font[]>(defaultFonts);
  const [loadedFonts, setLoadedFonts] = useState<Font[]>([]);

  useEffect(() => {
    if (unloadedFonts.length === 0) return;

    let newLoadedFonts =
      unloadedFonts.map((_font) => copyFont(_font)).
        filter((_font) => isFontAvailable(_font));

    setLoadedFonts((_loadedFonts) => _loadedFonts.concat(newLoadedFonts));
    setUnloadedFonts([]);
    setFontsLoaded(true);
    
    return () => {};
  }, [unloadedFonts]);

  const findFont:FindFont = (name) => {
    if (!name) return createFont();

    const index = loadedFonts.findIndex((_font) => (_font.name === name));

    return (index !== -1) ? loadedFonts[index] : loadedFonts[0];
  }

  const fonts:Fonts = {
    find:findFont,
    all: loadedFonts,
    loaded:fontsLoaded,
  }

  return fonts;
}

export default useFonts;