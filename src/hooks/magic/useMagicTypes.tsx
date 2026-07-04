'use client'

import { useMemo } from "react";
import useExternalData, { Transform } from "../useExternalData";
import { WError } from "@/components/magic/CardDisplay";

const transformMagicType:Transform<string> = (input) => {
  return input;
};

type Return = [
  error:WError,
  loaded:boolean,
  types:string[],
]
const useMagicTypes:()=>Return = () => {
  const [errorSuper, loadedSuper, superTypes] = useExternalData<string>(
    'https://api.scryfall.com/catalog/supertypes',
    transformMagicType);

  const [errorCard, loadedCard, cardTypes] = useExternalData<string>(
    'https://api.scryfall.com/catalog/card-types',
    transformMagicType);

  const [errorArtifact, loadedArtifact, artifactTypes] = useExternalData<string>(
    'https://api.scryfall.com/catalog/artifact-types',
    transformMagicType);

  const [errorBattle, loadedBattle, battleTypes] = useExternalData<string>(
    'https://api.scryfall.com/catalog/battle-types',
    transformMagicType);

  const [errorCreature, loadedCreature, creatureTypes] = useExternalData<string>(
    'https://api.scryfall.com/catalog/creature-types',
    transformMagicType);

  const [errorEnchantment, loadedEnchantment, enchantmentTypes] = useExternalData<string>(
    'https://api.scryfall.com/catalog/enchantment-types',
    transformMagicType);

  const [errorLand, loadedLand, landTypes] = useExternalData<string>(
    'https://api.scryfall.com/catalog/land-types',
    transformMagicType);

  const [errorPlaneswalker, loadedPlaneswalker, planeswalkerTypes] = useExternalData<string>(
    'https://api.scryfall.com/catalog/planeswalker-types',
    transformMagicType);

  const [errorSpell, loadedSpell, spellTypes] = useExternalData<string>(
    'https://api.scryfall.com/catalog/spell-types',
    transformMagicType);

  const types = useMemo(() =>
    superTypes.concat(cardTypes).concat(artifactTypes).concat(battleTypes).concat(creatureTypes)
      .concat(enchantmentTypes).concat(landTypes).concat(planeswalkerTypes).concat(spellTypes)
      .toSorted()
    , [superTypes, cardTypes, artifactTypes, battleTypes, creatureTypes, enchantmentTypes, landTypes, planeswalkerTypes, spellTypes]);
  
  return [errorCard, loadedCard, types]};

export default useMagicTypes;