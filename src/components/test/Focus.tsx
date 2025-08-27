'use client'

import { useRef } from "react";

export default function Focus({}) {
  const layer0 = useRef<any>(null);
  const layer1 = useRef<any>(null);

  const handleFocus = (name:string) => {
    console.log('focus ' + name, document.activeElement);
  };

  const handleBlur = (name:string) => {
    console.log('blur ' + name, document.activeElement);
  };

  const handleKeyDown = (name:string) => {
    console.log('keyDown ' + name);
  };

  const handleMouseDown = (name:string) => {
    console.log('mouseDown ' + name);
  }

  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      tabIndex={0}
      ref={layer0}
      onFocus={() => handleFocus('0')}
      onBlur={() => handleBlur('0')}
      onKeyDown={() => handleKeyDown('0')}
      onMouseDown={() => handleMouseDown('0')}
      style={{
        'backgroundColor':'#000000',
      }}>
      <div
        className="w-[80%] h-[80%] flex items-center justify-around"
        tabIndex={0}
        ref={layer1}
        onFocus={() => handleFocus('1')}
        onBlur={() => handleBlur('1')}
        onKeyDown={() => handleKeyDown('1')}
        onMouseDown={() => handleMouseDown('1')}
        style={{
          'backgroundColor':'#222222',
        }}>
        <div
          className="w-[30%] h-[60%] flex items-center justify-center"
          style={{
            backgroundColor:'#000444',
          }}>
          <div
            className="w-[20%] h-[40%]"
            style={{
              backgroundColor:'#000666',
            }}>

          </div>
        </div>
        <div
          className="w-[30%] h-[60%] flex items-center justify-center"
          style={{
            backgroundColor:'#444000'
          }}>
          <div
            className="w-[20%] h-[40%]"
            style={{
              backgroundColor:'#666000',
            }}>

          </div>
        </div>
      </div>
    </div>
  );
}