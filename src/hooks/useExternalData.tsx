'use client'

import { _err, _noError, _notFound, WError, WErrorCode } from "@/components/magic/CardDisplay";
import { useEffect, useState } from "react";

export type Transform<T> = (input:any)=>T;
export type ExternalDataOptions<T> = {
  // Represents the amount of data to fetch before
  // waiting for a command to fetch more.
  dataLimit?:number,
  // Return the total number of cards
  totalCards?:boolean,
  // A function to run on a *transformed* piece of data.
  onTransform?:(obj:T)=>void,
};

type ReturnOptions = {
  fetchNextData?:()=>void,
  totalCards?:number,
}
type Return<T> = [WError, boolean, T[], ReturnOptions]
function useExternalData<T> (
    url:string|undefined,
    transform:Transform<T>,
    options:ExternalDataOptions<T>={},
  ):Return<T> {
  const [data, setData] = useState<T[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<WError>(_noError);
  const [totalCards, setTotalCards] = useState<number>(0);
  const [nextUrl, setNextUrl] = useState<string|undefined>(url);

  const fetchData = async (url:string, controller:AbortController, sustain:boolean=true) => {
    let dataCount = 0;

    try {
      let overflow = (options.dataLimit) &&
                     (options.dataLimit <= dataCount);
      let chunkUrl = url;

      while ((!overflow) && (chunkUrl)) {
        let [chunkData, totalCards, nextUrl] = await chunk(chunkUrl);
        let transformedData = chunkData.map(transform);
        const {onTransform} = options;

        if (onTransform) {
          console.log('Applying Function');
          transformedData.forEach((_transformedData) => onTransform(_transformedData));
        }

        if (options.totalCards) {
          setTotalCards(totalCards);
          setLoaded(true);
        }

        if (!sustain) {
          setData(transformedData);
          sustain = true;

        } else
          setData((prev) => prev.concat(transformedData));

        chunkUrl = nextUrl;
        dataCount += transformedData.length;
        overflow = (options.dataLimit) &&
                     (options.dataLimit <= dataCount);
      }

      if (overflow) {
        setNextUrl(chunkUrl);
        console.info('overflowed: ' + dataCount + '/' + options.dataLimit + ', total cards loaded:' + data.length);
      }
      
      setError(_noError);
      setLoaded(true);
      console.info('-Loaded ', url);

    } catch (err) {
      if ((err instanceof Error)) {
        // Don't log abort errors.
        if (err.message === WErrorCode.NOT_FOUND) {
          //Not an error - just means the search was empty
          setError(_noError);
          setLoaded(true);
          setTotalCards(0);
          setData([]);
          setNextUrl(undefined);
          return;

        } else if (err.name !== 'AbortError') {
          console.error('Error with url ' + url, err);
          setError(_err(err));
          setLoaded(false);
          setData([]);
          setNextUrl(undefined);
          return;

        }
      }
    }

    async function chunk(url:string):Promise<[any[], number, string]> {
      const res = await fetch(url, { signal: controller.signal });
      const json = await res.json();
      const body = json.data;

      if (!body)
        throw Error(WErrorCode.NOT_FOUND);

      return [body, json.total_cards, json.next_page];
    };
  };

  const fetchNextData = (url=nextUrl, sustain=true) => {
    if (!url)
      return;

    const controller = new AbortController();
    let finished = false;

    console.log('Fetching...', url);
    fetchData(url, controller, sustain).finally(() => {
      finished = true;
    });

    return () => {
      if (!finished) {
        controller.abort();
        console.log('Cut off!', url);
      }
    }
  }

  useEffect(() => {
    if (!url) return;

    return fetchNextData(url, false);
  }, [url, transform]);

  return [error, loaded, data, {fetchNextData, totalCards}];
};

export default useExternalData;