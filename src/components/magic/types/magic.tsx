export enum GAME_TYPE {
  PAPER = "paper",
  ARENA = "arena",
  MTGO = "mtgo", 
  ASTRAL = "astral",
  SEGA = "sega",
};

export type MagicFormat = {
  name:string,
  acronym:string,
}

export const _magicFormatAny = {
  name:'',
  acronym:'',
}

export type MagicType = {
  name:string,
}

export type MagicSymbol = {
  imageUri:string,
  symbol:string,
}