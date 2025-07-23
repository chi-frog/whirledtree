'use client'

import { useRef, useState, useEffect } from "react";

function svgGetBBox (svgEl:any) {
  let tempDiv = document.createElement('div')
  tempDiv.setAttribute('style', "position:absolute; visibility:hidden; width:0; height:0")
  document.body.appendChild(tempDiv)
  let tempSvg = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
  tempDiv.appendChild(tempSvg)
  let tempEl = svgEl.cloneNode(true)
  tempSvg.appendChild(tempEl)
  let bb = tempEl.getBBox()
  document.body.removeChild(tempDiv)
  return bb;
}

function getTestBBox(fontSize:number) {
  let fontSizeTest = document.createElementNS(SVG_NS, "text");
  fontSizeTest.setAttribute('font-size', "" + fontSize);
  fontSizeTest.setAttribute("font-family", "Arial");
  fontSizeTest.setAttribute('style', "visibility:hidden;");
  fontSizeTest.textContent = "I";
  let canvas = document.querySelector("#canvas");
  let bboxTest;

  if (canvas) {
    canvas.appendChild(fontSizeTest);
    bboxTest = fontSizeTest.getBBox();
    console.log('fontSize', fontSize);
    console.log('TEMP ELEMENT', fontSizeTest);
    console.log('TEMPT ELEMTNDF BO', bboxTest);
    console.log('canvas', canvas);
    fontSizeTest.remove();
  }

  return bboxTest;
}

type cursorProps = {
  map: any,
  element:any,
}

const SVG_NS = "http://www.w3.org/2000/svg";

export default function Cursor({map, element} : cursorProps) {
  if ((!map) ||
      (!element)) {
    console.log('map or element doesnt exist');
    return null;
  }

  const elementRef = map.get(element.id);
  let x;
  let y;
  let width;
  let height;

  if (!elementRef) {
    const testBBox = getTestBBox(16);

    x = element.x;
    y = element.y;
    width=testBBox ? testBBox.width : 0;
    height = element.fontSize;
  } else {

    const testBBox = getTestBBox(element.fontSize);
    const bbox = elementRef.getBBox();

    console.log('testBBox', testBBox);
    console.log('element', element);
    console.log('bbox', bbox);

    x = element.x + bbox.width;
    y = bbox.y;// + bbox.height - (((bbox.y + bbox.height) - element.y) * 2);
    width = testBBox ? testBBox.width : 0;
    height = bbox.height;
  }

  console.log('height', height);

  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox="0 0 70.555555 282.22222"
      version="1.1"
      id="svg1"
      xmlns="http://www.w3.org/2000/svg">
    <defs
      id="defs1" />
    <g
      id="layer1">
      <path
         style={{
          baselineShift:"baseline",
          display:"inline",
          overflow:"visible",
          opacity:1,
          vectorEffect:"none",
          strokeLinejoin:"round",
          stopColor:"#000000",
          stopOpacity:1}}
       d="m 59.939453,0 c 0,0 -11.078451,-0.11918074 -21.794922,6.5800781 -10.71647,6.6992589 -20.729956,22.0530289 -20.503906,42.3007809 0.07803,6.989615 0.03053,175.873621 0,184.470701 -0.172214,48.49934 -7.01953,48.8711 -7.01953,48.8711 0,0 11.05028,0.0644 21.628906,-6.64063 10.578626,-6.70507 20.452208,-21.73746 20.666016,-41.85547 0.133061,-12.52029 0.01536,-173.616735 0,-185.240232 C 52.851773,-0.13418327 59.939453,0 59.939453,0 Z"
       id="path3" />
    </g>
    </svg>
  );
}