import { ANY } from "@/hooks/magic/useFilters"

export enum MagicCardClass {
  NORMAL='normal',
  DOUBLESIDED='doublesided',
  DOUBLEFACED='doublefaced',
};

export type MagicCard = {
  reversed:boolean,
  name: string,
  legalities: any,
  imageUris: { small: string, large: string },
} & (
  | {
      class:MagicCardClass.NORMAL,
    }
  | {
      class:MagicCardClass.DOUBLEFACED,
    }
  | {
      class:MagicCardClass.DOUBLESIDED,
      back:MagicCard,
    }
);

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