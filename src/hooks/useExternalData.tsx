'use client'

import { _err, _noError, _notFound, WError, WErrorCode } from "@/components/magic/CardDisplay";
import { useEffect, useState } from "react";

export type Transform<T> = (input:any)=>T;
export type ExternalDataOptions = {
  //Represents the amount of data to fetch before
  // waiting for a command to fetch more.
  dataLimit?:number,
};

type Return<T> = [WError, boolean, T[], (()=>void)|undefined]
function useExternalData<T> (
    url:string,
    transform:Transform<T>,
    options:ExternalDataOptions={},
  ):Return<T> {
  const [data, setData] = useState<T[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<WError>(_noError);
  const [fetchNext, setFetchNext] = useState<(()=>void)|undefined>();

  useEffect(() => {
    const controller = new AbortController();
    let data:T[] = [];

    const fetchData = async (url:string) => {
      try {
        let overflow = (options.dataLimit) &&
                       (options.dataLimit <= data.length);
        let chunkUrl:string|undefined = url;
        while ((!overflow) && (chunkUrl)) {
          let [chunkData, nextUrl] = await chunk(chunkUrl);
console.log('awaiting', chunkUrl);
          data.push(...chunkData.map(transform));
          chunkUrl = nextUrl;
          overflow = (options.dataLimit) &&
                     (options.dataLimit <= data.length);
        }

        if (overflow) {
          console.log('overflowed: ' + data.length + '/' + options.dataLimit);
        
        }
        setError(_noError);
        setLoaded(true);
        setData(data);
        console.log('-Loaded ', url);
      } catch (err) {
        console.log('Error with url', url);
        console.log('err', err);
        // Don't log abort errors - they're expected on cleanup
        if ((err instanceof Error)) {
          if (err.message === WErrorCode.NOT_FOUND) {
            setError(_noError);
            setLoaded(true);
            setData([]);
            return;

          } else if (err.name !== 'AbortError') {
            setError(_err(err));
            setLoaded(false);
            setData([]);
            return;
          }
        }
      }

      async function chunk(url:string):Promise<[any[], string|undefined]> {
        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();
        const body = json.data;

        if (!body)
          throw Error(WErrorCode.NOT_FOUND);

        return [body, json.next_page];
      };
    };

    console.log('+Starting ', url);
    fetchData(url).catch((err) => console.log('error', err));

    return () => {
      console.log('Aborting fetch for', url);
      controller.abort();
    };
  }, [url, transform]);

  return [error, loaded, data, fetchNext];
};

export default useExternalData;