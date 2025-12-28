export type MagicCard = {
  name:string,
  doublefaced?:boolean,
  legalities:any,
  imageUris:{small:string, large:string},
}

export type MagicSet = {
  name:string,
  acronym:string,
  type:string,
}

export type MagicFormat = {
  name:string,
}