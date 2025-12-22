'use client'

import { useEffect, useState } from "react";

export type Transform<T> = (input:any)=>T;

function useExternalData<T> (
    url:string,
    transform:Transform<T>,
  ):[boolean, T[]] {

  const [data, setData] = useState<T[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    let data:T[] = [];

    const fetchData = async (url:string) => {
      await chunk(url);

      async function chunk(url:string) {
        const res = await fetch(url);
        const json = await res.json();
        const body = json.data;

        data.push(...body.map(transform));

        if (json.has_more)
          await chunk(json.next_page);
        else {
          setLoaded(true);
          setData(data);
          console.log('data loaded');
        }
      };
    };

    fetchData(url).catch((err) => console.log('error', err));

    return controller.abort();
  }, [url, transform]);

  return [loaded, data];
};

export default useExternalData;