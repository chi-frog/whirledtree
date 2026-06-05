'use client'

import useMagicDatabase from "@/hooks/magic/useMagicDatabase";
import CardDisplay from "./CardDisplay";
import { constructSearchUrl } from "@/helpers/magic/scryfallUrl";

type Props = {};
const Landing:React.FC<Props> = () => {
  const database = useMagicDatabase(constructSearchUrl());

  return (
    <CardDisplay
      errorMap={database.errorMap}
      loadMap={database.loadMap}
      formats={database.formats}
      sets={database.sets}
      databaseCards={database.cards}
      imageMap={database.imageMap}
      hydrateLargeImage={database.hydrateLargeImage}
    />
  )
};

export default Landing;