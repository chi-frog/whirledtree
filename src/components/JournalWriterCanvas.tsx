'use client';
import React, { useState, } from 'react';
import '../app/journalWriter.css';
import Leaf from './Leaf';
import { leafTb, Leaf as LeafType } from '@/hooks/useLeaves';
import useRefMap from '@/hooks/useRefMap';
import { REGION, getMouseoverRegion } from '@/helpers/region';
import { Font } from '@/hooks/useFont';

type pEnum = {
  text:string,
}

type drag = {
  active: boolean,
  id: number,
  region: pEnum,
  offsetX:number,
  offsetY:number,
}
const dragDefault = {
  active:false,
  id:-1,
  region:REGION.NONE,
  offsetX:0,
  offsetY:0
}

type JournalWriterCanvasProps = {
  leaves:LeafType[],
  leafTb:leafTb,
  font:Font,
  fontSize:number,
}

export default function JournalWriterCanvas({leaves, leafTb, font, fontSize} : JournalWriterCanvasProps) {
  const [mouseDownPoint, setMouseDownPoint] = useState<{x:number, y:number}>({x:-1, y:-1});
  const [selectedId, setSelectedId] = useState<number>(0);
  const [focusedId, setFocusedId] = useState<number>(0);
  const [mouseoverRegion, setMouseoverRegion] = useState<pEnum>(REGION.NONE);
  const [drag, setDrag] = useState<drag>(dragDefault);
  const {getMap, getRef} = useRefMap();

  const mouseDownPointExists = () => (mouseDownPoint.x && mouseDownPoint.y);
  const clearMouseDownPoint = () => setMouseDownPoint({x:-1, y:-1});
  const isFocused = (leaf:LeafType) => (focusedId === leaf.id);

  const setElementOptionsFocus = (id:number, value:boolean) => {
    leafTb.updateField(id, 'optionsFocused', (_optionsFocused:boolean) => value)
    if (value)
      setFocusedId(0);
  };

  const handleMouseDownElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, leaf:LeafType) => {
    e.stopPropagation();

    if ((e.button !== 0) ||
        (e.detail > 2))
      return;

    const x = e.clientX;
    const y = e.clientY;

    setMouseDownPoint({x, y});

    if (isFocused(leaf)) return;

    setDrag({active:true, id:leaf.id, region:mouseoverRegion, offsetX:(e.clientX-leaf.x), offsetY:(e.clientY-leaf.y)});
  }

  const handleMouseUpElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, id:number) => {
    e.stopPropagation();

    if ((e.button !== 0) ||
        (e.detail > 2))
      return;

    const x = e.clientX;
    const y = e.clientY;

    if (mouseDownPointExists()) {
      if (selectedId !== id)
        leafTb.bringToFront(id);
        
      setSelectedId((e.detail !== 2) ? id : 0);
      setFocusedId((e.detail !== 2) ? id : 0);
      setMouseoverRegion((e.detail !== 2) ? getMouseoverRegion(x, y, id) : getMouseoverRegion(x, y, 0));
    }

    clearMouseDownPoint();
    setDrag(dragDefault);
  }

  const handleMouseDown = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if ((e.button !== 0) ||
        (e.detail > 2))
      return;

    const x = e.clientX;
    const y = e.clientY;

    setMouseDownPoint({x, y});
  }

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const {button, detail} = e;

    if ((button !== 0) ||
        (detail > 2) ||
        (!mouseDownPointExists()))
      return;

    if (drag.active) {
      setDrag(dragDefault);

    } else if (detail == 2) {
      e.preventDefault();
      setSelectedId(0);
      setFocusedId(0);

    } else {
      let x = e.clientX;
      let y = e.clientY;

      if (Math.sqrt(Math.pow(y-mouseDownPoint.y, 2) + Math.pow(x-mouseDownPoint.x, 2)) <= 5) {
        const id = leafTb.create({x, y, font, fontSize});
        setSelectedId(id);
        setFocusedId(id);
      }
    }

    clearMouseDownPoint();
  }

  const handleMouseDrag = (e:React.MouseEvent<SVGSVGElement>) => {
    const x = e.clientX;
    const y = e.clientY;

    switch(drag.region) {
      case REGION.BODY:
        leafTb.updateFields(drag.id, ['x', 'y'], [()=>x-drag.offsetX, ()=>y-drag.offsetY]);
        break;
      case REGION.TOP_SIDE:
        break;
      case REGION.NONE:
      default:
    }
  }

  const handleMouseMove = (e:React.MouseEvent<SVGSVGElement>) => {
    if (drag.active)
      return handleMouseDrag(e);

    setMouseoverRegion(getMouseoverRegion(e.clientX, e.clientY, focusedId));
  }

  const handleOnBlur = (content:string, id:number) => {
    console.log('canvas on blur');
    if (content === "")
      leafTb.remove(id);
    if (id === focusedId) {
      setFocusedId(0);
    }
  }

  const handleKeyDown = (e:React.KeyboardEvent<SVGTextElement>) => {
    switch(e.key) {
      case "Shift":
      case "Alt" :
      case "Control" :
      case "ArrowRight" :
      case "ArrowLeft" :
      case "ArrowUp" :
      case "ArrowDown" :
      case "CapsLock" :
        return;
      default:
    }

    e.preventDefault();

    if (selectedId>0) {
      switch (e.key) {
      case "Backspace":
        tbElements.transformContent(selectedId, (_content:string) => _content.substring(0, _content.length-1));
        break;
      case "Enter":
        break;
      case "Tab":
        tbElements.transformContent(selectedId, (_content:string) => _content + "   ");
        break;
      case "Delete":
        setSelectedId(0);
        tbElements.deleteElement(selectedId);
        return;
      default:
        tbElements.transformContent(selectedId, (_content:string) => _content + e.key);
      }
    }
  }

  const notifyElementFontSize = (id:number, fontSize:number) =>
    leafTb.updateField(id, 'fontSize', (_fontSize:number) => fontSize);

  return (
    <svg id="canvas"
      className="bg-rose-50 w-screen h-screen"
      onMouseDown={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseDown(e)}
      onMouseUp={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseUp(e)}
      onMouseMove={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseMove(e)}
      style={{
        cursor: (mouseoverRegion === REGION.NONE) ? `url("data:image/svg+xml,%3Csvg width='32' height='32' transform='rotate(-30)' viewBox='0 0 29.434981 33.899679' version='1.1' id='svg1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs id='defs1'%3E%3ClinearGradient id='linearGradient15'%3E%3Cstop style='stop-color:%236bf45d;stop-opacity:1;' offset='0' id='stop15' /%3E%3Cstop style='stop-color:%231dd64f;stop-opacity:0.54870129;' offset='1' id='stop16' /%3E%3C/linearGradient%3E%3CradialGradient xlink:href='%23linearGradient15' id='radialGradient16' cx='63.5' cy='63.183132' fx='63.5' fy='63.183132' r='54.901386' gradientTransform='matrix(1,0,0,1.1508476,0,-9.5310263)' gradientUnits='userSpaceOnUse' /%3E%3C/defs%3E%3Cg id='layer1' transform='translate(-2.3992417,0.03534225)'%3E%3Cpath id='path3' style='fill:url(%23radialGradient16);fill-opacity:1;fill-rule:evenodd;stroke:%23000000;stroke-width:0.264583;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1' d='m 73.557489,123.02279 c -0.09947,0.0791 0.06773,0.59642 0.225217,1.07986 0.121682,0.4176 0.303803,0.91135 0.303803,0.91135 0,0 0.28469,0.38815 0.635667,0.72905 0.366907,0.36564 0.813603,0.7105 0.98767,0.61416 1.635489,-1.05571 5.649529,-4.23399 5.649529,-9.94054 0,-15.17875 -28.54179,-29.316684 -47.336423,-32.981356 -4.862053,-0.948028 -9.503245,-1.291797 -13.157802,-0.729981 -5.832204,0.896586 -12.2017525,6.220245 -12.2660888,12.524429 -0.06259,6.136828 6.4512138,12.648168 12.5871148,12.587848 2.640745,-0.026 5.147839,-0.59127 7.636669,-1.96522 9.627464,-5.31479 17.331996,-22.315486 26.550837,-61.184875 5.250705,-22.14055 7.44053,-44.79967164 7.44053,-44.79967164 0,0 -6.091469,21.91598864 -11.302154,43.88379164 -5.830786,24.584336 -10.995993,39.853753 -15.967396,48.753699 -2.485701,4.449973 -4.903425,7.282301 -7.24225,8.980876 -2.338825,1.69857 -4.593759,2.33766 -7.155253,2.36284 -1.771009,0.0174 -4.044622,-1.07617 -5.774527,-2.80588 -1.729905,-1.729706 -2.823085,-4.002438 -2.805027,-5.77292 0.01908,-1.869954 1.073157,-3.872324 2.791641,-5.506488 1.718483,-1.634165 4.053989,-2.819853 6.108937,-3.135761 4.46685,-0.68669 11.562666,0.269552 19.079188,2.517305 7.516522,2.247754 15.51096,5.740139 22.10652,9.847097 5.276447,3.285567 9.647762,6.984397 12.184472,10.584387 1.69114,2.4 2.552262,4.70349 2.552262,6.83988 0,3.7935 -2.752929,5.90885 -3.833136,6.60612 z m -22.255448,3.31601 c 0.149167,0.0983 0.582663,-0.21158 0.950013,-0.56791 0.367507,-0.35649 0.661438,-0.75688 0.661438,-0.75688 0,0 0.667373,-1.87824 0.517134,-1.97279 l 0.01189,-0.0184 c -1.080208,-0.69727 -3.833139,-2.81263 -3.833139,-6.60613 0,-2.13639 0.861122,-4.43988 2.552262,-6.83988 2.53671,-3.59999 6.908024,-7.29882 12.184471,-10.584387 6.595559,-4.106958 14.589997,-7.599343 22.106519,-9.847097 7.516521,-2.247753 14.612333,-3.203995 19.079183,-2.517305 2.05495,0.315908 4.39046,1.501597 6.10894,3.135761 1.71849,1.634165 2.77256,3.636535 2.79165,5.506476 0.0181,1.770493 -1.07512,4.043225 -2.80503,5.772932 -1.72991,1.72971 -4.00352,2.82329 -5.77453,2.80588 -2.56403,-0.0252 -4.857,-0.6637 -7.242442,-2.3605 C 96.224959,99.791746 93.750821,96.967853 91.202202,92.531136 86.104964,83.657702 80.788941,68.425701 74.87185,43.863247 69.584955,21.919029 63.5,0 63.5,0 c 0,0 2.182815,22.662365 7.513478,44.792728 11.982229,49.73947 21.732364,62.896392 34.800342,63.024882 6.1359,0.0603 12.64971,-6.45102 12.58712,-12.58786 -0.0643,-6.304173 -6.43389,-11.627831 -12.26609,-12.524417 -3.65456,-0.561816 -8.295752,-0.218047 -13.157805,0.729981 -18.794632,3.664672 -47.33642,17.802606 -47.33642,32.981356 0,5.70655 4.014039,8.88484 5.649528,9.94055 z' transform='matrix(0.26742697,0,0,0.26742697,0.13511924,0.03534225)' /%3E%3C/g%3E%3C/svg%3E") 5 0, pointer` :
                (mouseoverRegion === REGION.BODY_FOCUSED) ? "text" :
                ((mouseoverRegion === REGION.LEFT_SIDE) ||
                  mouseoverRegion === REGION.RIGHT_SIDE) ? "ew-resize" :
                ((mouseoverRegion === REGION.TOP_SIDE) ||
                  mouseoverRegion === REGION.BOTTOM_SIDE) ? "ns-resize" :
                ((mouseoverRegion === REGION.TOP_RIGHT_CORNER) ||
                 (mouseoverRegion === REGION.BOTTOM_LEFT_CORNER)) ? "sw-resize" :
                ((mouseoverRegion === REGION.TOP_LEFT_CORNER) ||
                 (mouseoverRegion === REGION.BOTTOM_RIGHT_CORNER)) ? "nw-resize" :
                (mouseoverRegion === REGION.BODY) ? "grab" :
                `url("data:image/svg+xml,%3Csvg width='111.25032' height='128.12477' viewBox='0 0 29.434981 33.899679' version='1.1' id='svg1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs id='defs1'%3E%3ClinearGradient id='linearGradient15'%3E%3Cstop style='stop-color:%236bf45d;stop-opacity:1;' offset='0' id='stop15' /%3E%3Cstop style='stop-color:%231dd64f;stop-opacity:0.54870129;' offset='1' id='stop16' /%3E%3C/linearGradient%3E%3CradialGradient xlink:href='%23linearGradient15' id='radialGradient16' cx='63.5' cy='63.183132' fx='63.5' fy='63.183132' r='54.901386' gradientTransform='matrix(1,0,0,1.1508476,0,-9.5310263)' gradientUnits='userSpaceOnUse' /%3E%3C/defs%3E%3Cg id='layer1' transform='translate(-2.3992417,0.03534225)'%3E%3Cpath id='path3' style='fill:url(%23radialGradient16);fill-opacity:1;fill-rule:evenodd;stroke:%23000000;stroke-width:0.264583;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1' d='m 73.557489,123.02279 c -0.09947,0.0791 0.06773,0.59642 0.225217,1.07986 0.121682,0.4176 0.303803,0.91135 0.303803,0.91135 0,0 0.28469,0.38815 0.635667,0.72905 0.366907,0.36564 0.813603,0.7105 0.98767,0.61416 1.635489,-1.05571 5.649529,-4.23399 5.649529,-9.94054 0,-15.17875 -28.54179,-29.316684 -47.336423,-32.981356 -4.862053,-0.948028 -9.503245,-1.291797 -13.157802,-0.729981 -5.832204,0.896586 -12.2017525,6.220245 -12.2660888,12.524429 -0.06259,6.136828 6.4512138,12.648168 12.5871148,12.587848 2.640745,-0.026 5.147839,-0.59127 7.636669,-1.96522 9.627464,-5.31479 17.331996,-22.315486 26.550837,-61.184875 5.250705,-22.14055 7.44053,-44.79967164 7.44053,-44.79967164 0,0 -6.091469,21.91598864 -11.302154,43.88379164 -5.830786,24.584336 -10.995993,39.853753 -15.967396,48.753699 -2.485701,4.449973 -4.903425,7.282301 -7.24225,8.980876 -2.338825,1.69857 -4.593759,2.33766 -7.155253,2.36284 -1.771009,0.0174 -4.044622,-1.07617 -5.774527,-2.80588 -1.729905,-1.729706 -2.823085,-4.002438 -2.805027,-5.77292 0.01908,-1.869954 1.073157,-3.872324 2.791641,-5.506488 1.718483,-1.634165 4.053989,-2.819853 6.108937,-3.135761 4.46685,-0.68669 11.562666,0.269552 19.079188,2.517305 7.516522,2.247754 15.51096,5.740139 22.10652,9.847097 5.276447,3.285567 9.647762,6.984397 12.184472,10.584387 1.69114,2.4 2.552262,4.70349 2.552262,6.83988 0,3.7935 -2.752929,5.90885 -3.833136,6.60612 z m -22.255448,3.31601 c 0.149167,0.0983 0.582663,-0.21158 0.950013,-0.56791 0.367507,-0.35649 0.661438,-0.75688 0.661438,-0.75688 0,0 0.667373,-1.87824 0.517134,-1.97279 l 0.01189,-0.0184 c -1.080208,-0.69727 -3.833139,-2.81263 -3.833139,-6.60613 0,-2.13639 0.861122,-4.43988 2.552262,-6.83988 2.53671,-3.59999 6.908024,-7.29882 12.184471,-10.584387 6.595559,-4.106958 14.589997,-7.599343 22.106519,-9.847097 7.516521,-2.247753 14.612333,-3.203995 19.079183,-2.517305 2.05495,0.315908 4.39046,1.501597 6.10894,3.135761 1.71849,1.634165 2.77256,3.636535 2.79165,5.506476 0.0181,1.770493 -1.07512,4.043225 -2.80503,5.772932 -1.72991,1.72971 -4.00352,2.82329 -5.77453,2.80588 -2.56403,-0.0252 -4.857,-0.6637 -7.242442,-2.3605 C 96.224959,99.791746 93.750821,96.967853 91.202202,92.531136 86.104964,83.657702 80.788941,68.425701 74.87185,43.863247 69.584955,21.919029 63.5,0 63.5,0 c 0,0 2.182815,22.662365 7.513478,44.792728 11.982229,49.73947 21.732364,62.896392 34.800342,63.024882 6.1359,0.0603 12.64971,-6.45102 12.58712,-12.58786 -0.0643,-6.304173 -6.43389,-11.627831 -12.26609,-12.524417 -3.65456,-0.561816 -8.295752,-0.218047 -13.157805,0.729981 -18.794632,3.664672 -47.33642,17.802606 -47.33642,32.981356 0,5.70655 4.014039,8.88484 5.649528,9.94055 z' transform='matrix(0.26742697,0,0,0.26742697,0.13511924,0.03534225)' /%3E%3C/g%3E%3C/svg%3E") 64 64, pointer`,
        ...drag.active ? { cursor:"grabbing" } : {}
      }}>
      {leaves.map((_leaf) =>
        <Leaf
          key={_leaf.id}
          leaf={_leaf}
          ref={getRef.bind(null, _leaf.id)}
          map={getMap()}
          selected={_leaf.id === selectedId}
          focused={_leaf.id === focusedId}
          isDragged={_leaf.id === drag.id}
          notifyParentFocused={setElementOptionsFocus.bind(null, _leaf.id)}
          notifyChangeFontSize={notifyElementFontSize.bind(null, _leaf.id)}
          handleMouseDown={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseDownElement(e, _leaf)}
          handleMouseUp={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseUpElement(e, _leaf.id)}
          parentOnBlur={handleOnBlur.bind(null, _leaf.content, _leaf.id)}
          handleKeyDown={handleKeyDown}/>
      )}
    </svg>
  );
}
