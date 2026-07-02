'use client'

import useExternalData, { Transform } from "../useExternalData";
import { WError } from "@/components/magic/CardDisplay";

const transformMagicType:Transform<string> = (input) => {
  return input;
};

type Return = [
  error:WError,
  loaded:boolean,
  types:string[],
]
const useMagicTypes:()=>Return = () => {
  const [error, loaded, supertypes] = useExternalData<string>(
    'https://api.scryfall.com/catalog/supertypes',
    transformMagicType);
  
  return [error, loaded, supertypes]};

export default useMagicTypes;