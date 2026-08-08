/*
* Functions to construct valid scryfall requests
*/

import { GAME_TYPE } from "@/components/magic/types/magic";
import { ANY, defaultSelected, Selected, SKey } from "@/hooks/magic/useFilters";

const scryfallUrl = 'https://api.scryfall.com';
const bitCards = 'cards';
const bitSearch = 'search?q=';
const bitIncludeExtras = 'include_extras=true';

export const constructSearchUrl = (selected:Selected=defaultSelected) => {
  let url = scryfallUrl + '/' + bitCards + '/' + bitSearch;

  const keys = (Object.keys(selected) as SKey[]);
  const relevantKeys = keys.filter(
    (key) => Object.hasOwn(selected, key) && selected[key] !== ANY);

  let query = "";
  query = relevantKeys.reduce<string>((query, key) => {
    const arr = selected[key];
    if (!arr) return '';
    const value = arr[0].trim();

    console.log('arr', arr);
    console.log('value', value);

    switch(key) {
    case 'oracle':
      return query + key + ':\'' + value + '\'+';
    case 'name': 
    case 'type': 
    case 'set': 
    case 'format': 
    case 'game':
    default:
      return query + key + ':' + value + '+';
    }
  }, query);

  query = query.substring(0, url.length - 1);
  console.log('Using the thingy: ' + encodeURIComponent(query));

  url += query + '&order=name';

  return url;
};

// https://scryfall.com/search?q=%28oracle%3A%27gets+%2B2%2F%2B2%27%29+%28game%3Apaper%29+&unique=cards&as=grid&order=name