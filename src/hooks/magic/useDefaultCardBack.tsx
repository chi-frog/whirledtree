'use client'

import { fileExists } from "@/helpers/files";
import { useEffect } from "react";
import { fetchImage } from "./useMagicCards";

type Props = {

};
const useDefaultCardBack = ({}:Props={}) => {

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
    };

    getBackImage();
  }, []);
};

export default useDefaultCardBack;