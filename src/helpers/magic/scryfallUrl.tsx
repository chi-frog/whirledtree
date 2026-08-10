/*
* Functions to construct valid scryfall requests
*/

import { defaultSelected, Selected, SKey } from "@/hooks/magic/useFilters";

const scryfallUrl = 'https://api.scryfall.com';
const bitCards = 'cards';
const bitSearch = 'search?q=';
const bitIncludeExtras = 'include_extras=true';

const createSegment = (key:string, segment:string[]) => {
  console.log('createSegment ', segment);

  for (const value in segment) {
    console.log('' + value);
  }

  const value = segment[0].trim();

  console.log('segment', segment);
  console.log('value', value);

  let result = "(";

  switch(key) {
    case 'oracleText':
      result += 'oracle';
      break;
    default:
      result += key;
  }

  switch(key) {
  case 'oracleText':
  case 'name':
    result += ':\'' + value + '\'';
    break;
  case 'type': 
  case 'set': 
  case 'format': 
  case 'game':
  default:
    result += ':' + value;
  }

  return result + ")";
};

export const constructSearchUrl = (selected:Selected=defaultSelected) => {
  let url = scryfallUrl + '/' + bitCards + '/' + bitSearch;

  const keys = (Object.keys(selected) as SKey[]);
  const relevantKeys = keys.filter(
    (key) => Object.hasOwn(selected, key) && selected[key].length > 0);

  let query = "";
  query = relevantKeys.reduce<string>((query, key, index) => {
    const arr = selected[key];
    if (!arr) return '';

    return (index !== relevantKeys.length - 1) ?
      query + createSegment(key, arr) + '+' :
      query + createSegment(key, arr);
  }, query);

  console.log('Using the thingy: ' + encodeURIComponent(query));

  url += query + '&order=name';

  return url;
};

// https://scryfall.com/search?q=%28oracle%3A%27gets+%2B2%2F%2B2%27%29+%28game%3Apaper%29+&unique=cards&as=grid&order=name