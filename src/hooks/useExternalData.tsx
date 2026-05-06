'use client'

import { _noError, _notFound, WError, WErrorCode } from "@/components/magic/CardDisplay";
import { useEffect, useState } from "react";

export type Transform<T> = (input:any)=>T;

function useExternalData<T> (
    url:string,
    transform:Transform<T>,
  ):[WError, boolean, T[]] {

  const [data, setData] = useState<T[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<WError>(_noError);

  useEffect(() => {
    const controller = new AbortController();
    let data:T[] = [];

    const fetchData = async (url:string) => {
      try {
        await chunk(url);
      } catch (err) {
        console.log('Error with url', url);
        console.log('err', err);
        // Don't log abort errors - they're expected on cleanup
        if ((err instanceof Error)) {
          if (err.message === WErrorCode.NOT_FOUND) {
            setError(_notFound);
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
          throw Error(WErrorCode.NOT_FOUND);

        data.push(...body.map(transform));

        if (json.has_more)
          await chunk(json.next_page);
        else {
          setError(_noError);
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