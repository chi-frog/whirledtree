/*
* Functions to construct valid scryfall requests
*/

import { ANY, Selected, SKey } from "@/hooks/magic/useFilters";

const scryfallUrl = 'https://api.scryfall.com';
const bitCards = 'cards';
const bitSearch = 'search?include_extras=true&q=';

export const constructSearchUrl = (selected:Selected={}) => {
  let url = scryfallUrl + '/' + bitCards + '/' + bitSearch;
  let name = selected.name;
  let set = selected.set;
  let format = selected.format;
  let type = selected.type;

  const keys = (Object.keys(selected) as SKey[]);
  const relevantKeys = keys.filter(
    (key) => Object.hasOwn(selected, key) && selected[key] !== ANY);
  console.log('keys', keys);
  console.log('relevantKeys', relevantKeys);

  if (relevantKeys.length === 0) {
    return 'https://api.scryfall.com/cards/search?q=game:paper';
  }

  url = relevantKeys.reduce<string>((url, key) => {
    switch(key) {
    case 'name': return url + key + ':' + selected[key] + '+';
    case 'type': return url + key + ':' + selected[key] + '+';
    case 'set': return url + key + ':' + selected[key] + '+';
    case 'format': return url + key + ':' + selected[key] + '+';
    }
  }, url);

  url.substring(0, url.length - 1);

  return url;
};