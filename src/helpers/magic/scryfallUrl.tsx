/*
* Functions to construct valid scryfall requests
*/

const scryfallUrl = 'https://api.scryfall.com'
const bitSets = 'sets';
const bitCards = 'cards';
const bitSearch = 'search?q=';
const bitSearchFormat = 'f';
const bitSearchSet = 's';

type ConstructUrl = (

)=>string;
export const constructSearchUrl = (
  selectedSets:string[],
  selectedFormats:string[],
) => {
  let url = scryfallUrl + '/' + bitCards + '/' + bitSearch;

  if (selectedSets[0] !== "All")
    url += bitSearchSet + ':' + selectedSets[0];
  
  if (selectedFormats[0] !== "All") {
    if (selectedSets[0] !== "All")
      url += "+";
    url += bitSearchFormat + ':' + selectedFormats[0];
  }

  return url;
};