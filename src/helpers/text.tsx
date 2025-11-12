'use client';
/* Functions for working with text
*/

const SVG_NS = "http://www.w3.org/2000/svg";
const emptyDimension =
  {x:0, y:0, width:0, height:0};

const getSVGTextBBox = (
    text:string,
    fontName:string,
    fontSize:number,
    svgId?:string,
    x?:number, y?:number) => {
  let el;
   
  try {
    el = document.createElementNS(SVG_NS, "text");
  } catch {
    return emptyDimension;
  }

  el.setAttribute('font-size', "" + fontSize);
  el.setAttribute("font-family", fontName);
  el.setAttribute('style', 'visibility:hidden;');
  el.setAttribute('style', 'whitespace:preserve')
  if (x) el.setAttribute('x', '' + x);
  if (y) el.setAttribute('y', '' + y);
  el.textContent = text;

  if (!svgId) throw Error("Unimplemented feature missing svgId");

  let canvas = document.querySelector(svgId);
  let bbox;

  if (canvas) {
    canvas.appendChild(el);
    bbox = el.getBBox();
    bbox.width = Math.max(bbox.width, el.getComputedTextLength());
    el.remove();
  } else
    bbox = emptyDimension;

  return bbox;
};

export const fitText = (
    text:string,
    maxWidth:number,
    fontName:string,
    fontSize:number,
    svgId?:string) => {

  let dims = getSVGTextBBox(text, fontName, fontSize, svgId);
  let newString = text;

  if (dims.width > maxWidth) {
    let end = text.length - 1;
    newString = text.slice(0, end) + "...";
    dims = getSVGTextBBox(newString, fontName, fontSize, svgId);

    while ((dims.width > maxWidth) && (end >= 0)) {
      end--;
      newString = newString.slice(0, end) + "...";
      dims = getSVGTextBBox(newString, fontName, fontSize, svgId);
    }
  }

  return newString;
};