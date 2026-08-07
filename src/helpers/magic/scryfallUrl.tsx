/*
* Functions to construct valid scryfall requests
*/

import { GAME_TYPE } from "@/components/magic/types/magic";
import { ANY, Selected, SKey } from "@/hooks/magic/useFilters";

const scryfallUrl = 'https://api.scryfall.com';
const bitCards = 'cards';
const bitSearch = 'search?q=';
const bitIncludeExtras = 'include_extras=true';

export const constructSearchUrl = (selected:Selected={game:GAME_TYPE.PAPER}) => {
  let url = scryfallUrl + '/' + bitCards + '/' + bitSearch;
  let query = 'q=';

  const keys = (Object.keys(selected) as SKey[]);
  const relevantKeys = keys.filter(
    (key) => Object.hasOwn(selected, key) && selected[key] !== ANY);

  url = relevantKeys.reduce<string>((url, key) => {
    const value = selected[key]?.trim();

    switch(key) {
    case 'oracle':
      return url + key + ':\'' + value + '\'+';
    case 'name': 
    case 'type': 
    case 'set': 
    case 'format': 
    case 'game':
    default:
      return url + key + ':' + value + '+';
    }
  }, url);

  url = url.substring(0, url.length - 1);
  url += '&order=name';

  return url;
};