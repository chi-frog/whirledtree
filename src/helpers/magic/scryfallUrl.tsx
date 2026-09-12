/*
* Functions to construct valid scryfall requests
*/

import { defaultSelected, Selected, SelectedSection, SKey } from "@/hooks/magic/useFilters";

const scryfallUrl = 'https://api.scryfall.com';
const bitCards = 'cards';
const bitSearch = 'search?q=';
const bitIncludeExtras = 'include_extras=true';

const createSegment = (key:string, section:SelectedSection) => {
  let value = section.value.trim();

  let result = (section.polarity) ? "(" : "-(";

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
    (key) => (Object.hasOwn(selected, key)) &&
             (selected[key].length > 0) &&
             (selected[key][0].value !== ''));

  let query = "";
  query = relevantKeys.reduce<string>((query, key, index) => {
    const section = selected[key];
    if (!section || section[0].value === '') return '';

    let segment = section.slice(0, -1).reduce<string>((_segment, _section) => {
      return _segment + createSegment(key, _section) + '+';
    }, "");
    
    return (index !== relevantKeys.length - 1) ?
      query + segment.substring(0, segment.length - 1) + '+':
      query + segment.substring(0, segment.length - 1);
  }, query);

  url += query + '&order=name';
  console.log('Constructed URL:' + url);

  return url;
};

// https://scryfall.com/search?q=%28oracle%3A%27gets+%2B2%2F%2B2%27%29+%28game%3Apaper%29+&unique=cards&as=grid&order=name