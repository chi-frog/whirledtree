'use client'

import { _err, _noError, _notFound, WError, WErrorCode } from "@/components/magic/CardDisplay";
import { useEffect, useState } from "react";

export type Transform<T> = (input:any)=>T;
export type ExternalDataOptions = {
  // Represents the amount of data to fetch before
  // waiting for a command to fetch more.
  dataLimit?:number,
  // Return the total number of cards
  totalCards?:boolean,
};

type ReturnOptions = {
  fetchNext?:(()=>void),
  totalCards?:number,
}
type Return<T> = [WError, boolean, T[], ReturnOptions]
function useExternalData<T> (
    url:string,
    transform:Transform<T>,
    options:ExternalDataOptions={},
  ):Return<T> {
  const [data, setData] = useState<T[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<WError>(_noError);
  const [totalCards, setTotalCards] = useState<number>(0);
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
          let [chunkData, totalCards, nextUrl] = await chunk(chunkUrl);
          let transformedData = chunkData.map(transform);

          if (options.totalCards) {
            setTotalCards(totalCards);
            setLoaded(true);
          }
          setData((prev) => prev.concat(transformedData));
          data = data.concat(transformedData);
          chunkUrl = nextUrl;
          overflow = (options.dataLimit) &&
                     (options.dataLimit <= data.length);
        }

        if (overflow) {
          console.info('overflowed: ' + data.length + '/' + options.dataLimit);
        }
        setError(_noError);
        setLoaded(true);
        setData(data);
        console.info('-Loaded ', url);
      } catch (err) {
        if ((err instanceof Error)) {
          // Don't log abort errors.
          if (err.message === WErrorCode.NOT_FOUND) {
            //Not an error - just means the search was empty
            setError(_noError);
            setLoaded(true);
            setData([]);
            return;

          } else if (err.name !== 'AbortError') {
            console.error('Error with url ' + url, err);
            setError(_err(err));
            setLoaded(false);
            setData([]);
            return;

          }
        }
      }

      async function chunk(url:string):Promise<[any[], number, string|undefined]> {
        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();
        const body = json.data;

        if (!body)
          throw Error(WErrorCode.NOT_FOUND);

        return [body, json.total_cards, json.next_page];
      };
    };

    fetchData(url).catch((err) => console.error('error', err));

    return () => {
      controller.abort();
    };
  }, [url, transform]);

  return [error, loaded, data, {fetchNext, totalCards}];
};

export default useExternalData;