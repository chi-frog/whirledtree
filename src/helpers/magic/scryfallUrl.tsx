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

export const constructSearchUrl = (
    set:string,
    format:string,
    name:string,
  ) => {
  let url = scryfallUrl + '/' + bitCards + '/' + bitSearch;

  if (name)
    url += name;

  if (set !== ANY) {
    if (name)
      url += "+";
    url += bitSearchSet + ':' + set;
  }
  
  if (format !== ANY) {
    if (set !== ANY)
      url += "+";
    url += bitSearchFormat + ':' + format;
  }

  return url;
};