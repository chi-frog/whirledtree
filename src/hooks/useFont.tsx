'use client'

import { useState } from "react";

function Fonts() {
  const availableFonts = ["Aharoni", "Arial", "Helvetica"];

  return {availableFonts};
}

const {availableFonts} = Fonts();

function useFont(defaultFont:string="Arial", defaultFontSize:number=16) {
  const [font, setFont] = useState<string>(defaultFont);
  const [fontSize, setFontSize] = useState<number>(defaultFontSize);

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

  return {font, fontSize, availableFonts};
}

export default useFont;