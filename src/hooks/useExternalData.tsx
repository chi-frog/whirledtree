'use client'

import { useState } from "react";



type Props = {
  url:string,
};
const useDataLoading = (url:string) => {
  const [data, setData] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  return [data, loaded];
};