'use client'

import SearchWindow from "./SearchWindow";
import { ImageRepoProvider } from "../general/ImageRepoProvider";
import useMagicResources from "@/hooks/magic/useMagicResources";
import { ImageStorageProvider } from "../general/ImageStorageProvider";

type Props = {};
const Landing:React.FC<Props> = () => {
  const resources = useMagicResources();

  return (
    <ImageStorageProvider>
    <ImageRepoProvider>
      <SearchWindow
        resources={resources}/>
    </ImageRepoProvider>
    </ImageStorageProvider>
  );
};

export default Landing;