import { MagicCard } from "../types/default"

export const transformCard:(card:any)=>MagicCard = (card:any) => ({
  name:card.name,
  doubledfaced:(card.card_faces !== undefined),
  legalities:card.legalities,
  imageUris:{
    small:card.image_uris.small,
    large:card.image_uris.large,
  }
  });