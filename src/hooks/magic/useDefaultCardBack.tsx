'use client'

import { fileExists } from "@/helpers/files";
import { useEffect, useRef, useState } from "react";
import { fetchImage } from "./useMagicCards";

type DefaultCardBack = {
  ready:boolean,
  uri:string,
}
const defaultCardBack:DefaultCardBack = {
  ready:false,
  uri:'',
}
let inProcess = false;

type Props = {

};
const useDefaultCardBack:(p?:Props)=>DefaultCardBack = ({}:Props={}) => {
  // Get the card back image
  useEffect(() => {
    const getBackImage = async () => {
      let backUrl;

      console.log('Searching for back image...');
      if (await fileExists('magic/defaultCardBack.png'))
        backUrl = await fetchImage('magic/defaultCardBack.png');
      else
        backUrl = await fetchImage('https://cards.scryfall.io/back.png');

      console.log('LANDING Finished with back image!', backUrl);
      defaultCardBack.ready = true;
      defaultCardBack.uri = backUrl ? backUrl : "";
      inProcess = false;
    };

    if ((!defaultCardBack.ready) &&
        (!inProcess)) {
      console.log('Beginning to get image!');
      inProcess = true;
      getBackImage();
    }
  }, []);

  return defaultCardBack;
};

export default useDefaultCardBack;