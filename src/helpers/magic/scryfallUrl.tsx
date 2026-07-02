/*
* Functions to construct valid scryfall requests
*/

import { ANY, Selected } from "@/hooks/magic/useFilters";

const scryfallUrl = 'https://api.scryfall.com';
const bitSets = 'sets';
const bitCards = 'cards';
const bitSearch = 'search?q=';
const bitSearchFormat = 'f';
const bitSearchSet = 's';

export const constructSearchUrl = (selected:Selected={}) => {
  let url = scryfallUrl + '/' + bitCards + '/' + bitSearch;
  let name = selected.name;
  let set = selected.set;
  let format = selected.format;
  let type = selected.type;

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