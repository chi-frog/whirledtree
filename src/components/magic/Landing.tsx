'use client'

import SearchWindow from "./SearchWindow";
import { ImageRepoProvider } from "../general/ImageRepoProvider";
import useMagicResources from "@/hooks/magic/useMagicResources";

type Props = {};
const Landing:React.FC<Props> = () => {
  const resources = useMagicResources();

  return (
    <ImageRepoProvider>
      <SearchWindow
        resources={resources}/>
    </ImageRepoProvider>
  );
};

export default Landing;