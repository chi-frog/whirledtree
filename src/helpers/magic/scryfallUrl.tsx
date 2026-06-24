/*
* Functions to construct valid scryfall requests
*/

import { ANY } from "@/hooks/magic/useFilters";

const scryfallUrl = 'https://api.scryfall.com'
const bitSets = 'sets';
const bitCards = 'cards';
const bitSearch = 'search?q=';
const bitSearchFormat = 'f';
const bitSearchSet = 's';

type PossibleSelections = {
  set?:string,
  format?:string,
  name?:string,
}
export const constructSearchUrl = ({
    set,
    format,
    name,
  }:PossibleSelections={}) => {
  let url = scryfallUrl + '/' + bitCards + '/' + bitSearch;

  if (name)
    url += name;

  if (set && set !== ANY) {
    if (name)
      url += "+";
    url += bitSearchSet + ':' + set;
  } else {
    if (!name)
      url += bitSearchSet + ':'
  }
  
  if (format && format !== ANY) {
    if (set !== ANY)
      url += "+";
    url += bitSearchFormat + ':' + format;
  }

  return url;
};