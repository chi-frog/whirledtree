'use client'

import useMagicDatabase from "@/hooks/magic/useMagicDatabase";
import CardDisplay from "./CardDisplay";
import { constructSearchUrl } from "@/helpers/magic/scryfallUrl";

type Props = {};
const Landing:React.FC<Props> = () => {
  const [errorMap, loadMap, formats, sets, databaseCards, imageMap, hydrateLargeImage] =
    useMagicDatabase(constructSearchUrl());

  return (
    <CardDisplay
      errorMap={errorMap}
      loadMap={loadMap}
      formats={formats}
      sets={sets}
      databaseCards={databaseCards}
      imageMap={imageMap}
      hydrateLargeImage={hydrateLargeImage}
    />
  )
};

export default Landing;