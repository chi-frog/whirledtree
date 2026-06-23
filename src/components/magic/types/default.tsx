import { ANY } from "@/hooks/magic/useFilters"

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
  (card.layout === MagicCardLayout.PREPARE) ||
  (card.layout === MagicCardLayout.PROTOTYPE);

export type MagicCard = {
  reversed:boolean,
  name:string,
  legalities:any,
  set:string,
  typeLine:string,
  oracleText:string,
  power:string,
  toughness:string,
  alchemy:boolean,
  siblings:MagicCard[],
  imageUris:{ small: string, large: string },
  layout:MagicCardLayout,
  extra?:MagicCard,
  back?:MagicCard,
  };

export type MagicSet = {
  name:string,
  acronym:string,
  type:string,
}

export const _magicSetAny = {
  name:ANY,
  acronym:'',
  type:'',
}

export type MagicFormat = {
  name:string,
}