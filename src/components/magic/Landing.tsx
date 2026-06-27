'use client'

import useMagicDatabase from "@/hooks/magic/useMagicDatabase";
import CardDisplay from "./CardDisplay";
import { constructSearchUrl } from "@/helpers/magic/scryfallUrl";
import useFilters from "@/hooks/magic/useFilters";
import { useMemo } from "react";

type Props = {};
const Landing:React.FC<Props> = () => {
  const {selected, updateSelected, handlers} = useFilters();
  const url = useMemo(() => constructSearchUrl(selected), [selected]);
  const database = useMagicDatabase(url);

  return (
    <CardDisplay
      errorMap={database.errorMap}
      loadMap={database.loadMap}
      formats={database.formats}
      sets={database.sets}
      symbols={database.symbols}
      symbolImageMap={database.symbolImageMap}
      databaseCards={database.cards}
      imageMap={database.imageMap}
      hydrateLargeImage={database.hydrateLargeImage}
      selected={selected}
      updateSelected={updateSelected}
      handlers={handlers}
    />
  )
};

export default Landing;