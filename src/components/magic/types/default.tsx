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
} & (
  | {
      class:MagicCardClass.NORMAL,
      imageUris: { small: string, large: string },
    }
  | {
      class:MagicCardClass.DOUBLEFACED,
      imageUris: { small:string, large: string},
    }
  | {
      class:MagicCardClass.DOUBLESIDED,
      imageUris: {
        front: { small: string, large: string },
        back: { small: string, large: string },
      },
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