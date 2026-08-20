export enum MagicCardLayout {
  NORMAL='normal',
  SPLIT='split',
  FLIP='flip',
  TRANSFORM='transform',
  MODAL_DFC='modal_dfc',
  MELD='meld',
  LEVELER='leveler',
  CLASS='class',
  CASE='case',
  SAGA='saga',
  ADVENTURE='adventure',
  PREPARE='prepare',
  MUTATE='mutate',
  PROTOTYPE='prototype',
  BATTLE='battle',
  PLANAR='planar',
  SCHEME='scheme',
  VANGUARD='vanguard',
  TOKEN='token',
  DFC_TOKEN='double_faced_token',
  EMBLEM='emblem',
  AUGMENT='augment',
  HOST='host',
  ART_SERIES='art_series',
  REVERSIBLE='reversible',
  };

export const isCardDoublesided = (card:MagicCard) =>
  (card.layout === MagicCardLayout.MODAL_DFC) ||
  (card.layout === MagicCardLayout.TRANSFORM);

export const isCardMultiple = (card:MagicCard) =>
  (card.layout === MagicCardLayout.ADVENTURE) ||
  (card.layout === MagicCardLayout.PREPARE);

export type MagicCard = {
  id:string,
  oracleId:string,
  name:string,
  reversed:boolean,
  legalities:any,
  set:string,
  typeLine:string,
  oracleText:string,
  flavorText:string,
  power:string,
  toughness:string,
  manaCost:string,
  alchemy:boolean,
  siblings:MagicCard[],
  imageUris:{ small: string, large: string },
  printsUri:string,
  layout:MagicCardLayout,
  extra?:MagicCard,
  back?:MagicCard,
  };

export const _magicCard = {
  reversed:false,
  name:"",
  legalities:{},
  set:"",
  typeLine:"",
  oracleText:"",
  flavorText:"",
  power:"",
  toughness:"",
  manaCost:"",
  alchemy:false,
  siblings:[],
  imageUris:{small:"", large:""},
  printsUri:"",
  layout:MagicCardLayout.NORMAL,
}

export type MagicSet = {
  name:string,
  acronym:string,
  type:string,
}

export const _magicSetAny = {
  name:'',
  acronym:'',
  type:'',
}

export type MagicFormat = {
  name:string,
}

export const _magicFormatAny = {
  name:'',
}