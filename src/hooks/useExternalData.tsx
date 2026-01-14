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
      try {
        await chunk(url);
      } catch (err) {
        // Don't log abort errors - they're expected on cleanup
        if ((err instanceof Error) && err.name !== 'AbortError')
          console.log('error', err);
      }

      async function chunk(url:string) {
        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();
        const body = json.data;

        data.push(...body.map(transform));

        if (json.has_more)
          await chunk(json.next_page);
        else {
          setLoaded(true);
          setData(data);
          console.log('-Loaded ', url);
        }
      };
    };

    console.log('+Starting ', url);
    fetchData(url).catch((err) => console.log('error', err));

    return () => {
      console.log('Aborting fetch for', url);
      controller.abort();
    };
  }, [url, transform]);

  return [loaded, data];
};

export default useExternalData;