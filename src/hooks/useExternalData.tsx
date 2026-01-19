'use client'

import { WError } from "@/components/magic/SearchResults";
import { useEffect, useState } from "react";

export type Transform<T> = (input:any)=>T;

function useExternalData<T> (
    url:string,
    transform:Transform<T>,
  ):[WError, boolean, T[]] {

  const [data, setData] = useState<T[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<WError>(WError.NO_ERROR);

  useEffect(() => {
    const controller = new AbortController();
    let data:T[] = [];

    const fetchData = async (url:string) => {
      try {
        await chunk(url);
      } catch (err) {
        // Don't log abort errors - they're expected on cleanup
        if ((err instanceof Error)) {
          if (err.message === WError.NOT_FOUND) {
            setError(WError.NOT_FOUND);
            setLoaded(true);
            setData([]);
            return;

          } else if (err.name !== 'AbortError')
            console.log('error', err);
        }
      }

      async function chunk(url:string) {
        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();
        const body = json.data;

        if (!body)
          throw Error(WError.NOT_FOUND);

        data.push(...body.map(transform));

        if (json.has_more)
          await chunk(json.next_page);
        else {
          setError(WError.NO_ERROR);
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

  return [error, loaded, data];
};

export default useExternalData;