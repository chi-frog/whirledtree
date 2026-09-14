'use client'

import useMagicDatabase from "@/hooks/magic/useMagicDatabase";
import CardDisplay from "./CardDisplay";
import { constructSearchUrl } from "@/helpers/magic/scryfallUrl";
import useFilters from "@/hooks/magic/useFilters";
import { useEffect, useMemo, useState } from "react";
import { ModalProvider } from "../general/ModalProvider";
import { ImageRepoProvider } from "../general/ImageRepoProvider";
import useMagicSets from "@/hooks/magic/useMagicSets";

type Props = {};
const Landing:React.FC<Props> = () => {
  const [setsError, setsLoaded, sets] = useMagicSets();
  const {selected, updateSelected, handlers} = useFilters();
  const url = useMemo(() => constructSearchUrl(selected, sets), [selected, sets]);
  const [displayLimit, setDisplayLimit] = useState<number>(175);
  const database = useMagicDatabase(url, displayLimit, sets);

  useEffect(() => {
    console.table(selected);
  }, [selected]);

  useEffect(() => {
    console.log('Url is: ' + url);
  }, [url]);

  return (
    <ImageRepoProvider>
    <ModalProvider db={database} updateSelected={updateSelected}>
      <CardDisplay
        db={database}
        selected={selected}
        handlers={handlers}/>
    </ModalProvider>
    </ImageRepoProvider>
  );
};

export default Landing;