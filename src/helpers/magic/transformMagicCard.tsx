import { isCardDoublesided, isCardMultiple, MagicCard, MagicCardLayout, MagicPrint } from "@/components/magic/types/default";
import { Transform } from "@/hooks/useExternalData";

const convertToManaCost = (manaCost:string) => {
  return manaCost;
};

export const transformPrint:(card:any)=>[string, MagicPrint] = (card) => {
  let front = (card.card_faces) ? card.card_faces[0] : card;
  let back = (card.card_faces) ? card.card_faces[1] : undefined;

  return [card.id, {
    isAlchemy:false,
    imageUris:{
      front:{
        small:front.image_uris?.small,
        large:front.image_uris?.large,
      },
      ...(back && {
      back: {
        small:back.image_uris?.small,
        large:back.image_uris?.large,
      }})
    }
  }]};

export const transformMagicCard: Transform<MagicCard> = (card) => {
  let [printId, print] = transformPrint(card);

  let transformedCard = ({
    oracleId:card.oracle_id,
    reversed:false,
    name:card.name, //!
    layout:(card.layout) as MagicCardLayout,
    legalities:card.legalities,
    set:card.set,
    typeLine:card.type_line, //!
    oracleText:card.oracle_text,
    flavorText:card.flavor_text,
    power:card.power,
    toughness:card.toughness,
    manaCost:convertToManaCost(card.mana_cost),
    siblings:[],
    imageUris:{
      small:card.image_uris?.small,
      large:card.image_uris?.large,
    },
    printsUri:card.prints_search_uri,
    prints:new Map<string, MagicPrint>([
      [printId, print]
    ]),
    printId,
  }) as MagicCard;

  if (isCardDoublesided(transformedCard)) {
    const front = card.card_faces[0];
    const back = card.card_faces[1];

    transformedCard.name = front.name;
    transformedCard.typeLine = front.type_line;
    transformedCard.oracleText = front.oracle_text;
    transformedCard.power = front.power;
    transformedCard.toughness = front.toughness;
    transformedCard.manaCost = front.mana_cost;
    transformedCard.back = ({
      name:back.name,
      typeLine:back.type_line,
      oracleText:back.oracle_text,
      power:back.power,
      toughness:back.toughness,
      manaCost:back.mana_cost,
    }) as MagicCard;
  } else if (isCardMultiple(transformedCard)) {
    const main = card.card_faces[0];
    const extra = card.card_faces[1];

    transformedCard.name = main.name;
    transformedCard.typeLine = main.type_line,
    transformedCard.extra = {
      ...transformedCard,
      name:extra.name,
      typeLine:extra.type_line,
      oracleText:extra.oracle_text,
      manaCost:extra.mana_cost,
    }
  }

  return transformedCard;
};