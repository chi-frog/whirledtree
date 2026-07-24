'use client'

import useMagicDatabase from "@/hooks/magic/useMagicDatabase";
import CardDisplay from "./CardDisplay";
import { constructSearchUrl } from "@/helpers/magic/scryfallUrl";
import useFilters from "@/hooks/magic/useFilters";
import { useMemo, useState } from "react";
import { ModalProvider } from "../general/ModalProvider";

type Props = {};
const Landing:React.FC<Props> = () => {
  const {selected, updateSelected, handlers} = useFilters();
  const url = useMemo(() => constructSearchUrl(selected), [selected]);
  const [displayLimit, setDisplayLimit] = useState<number>(175);
  const database = useMagicDatabase(url, displayLimit);

  return (
    <ModalProvider db={database} updateSelected={updateSelected}>
    <CardDisplay
      db={database}
      selected={selected}
      updateSelected={updateSelected}
      handlers={handlers}
    />
    </ModalProvider>
  )
};

export default Landing;