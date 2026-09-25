export type Face = {
  small:string,
  large:string,
}
export type PrintSize = keyof Face;
export type Print = {
  front:Face,
  back:Face,
}
export type PrintSide = keyof Print;
export type PrintMap = Map<string, Print>;
// First string: card.oracleId
// Second string: card.id
export type ImageMap = Map<string, PrintMap>;

export const initFace:()=>Face = () =>
  ({small:'', large:''});
export const initPrint:()=>Print = () =>
  ({front:initFace(), back:initFace()});
export const initPrintMap:()=>PrintMap = () =>
  new Map<string, Print>();
export const initImageMap:()=>ImageMap = () =>
  new Map<string, PrintMap>();

export const copyFace:(face:Face)=>Face =
  (face) => ({...face});
export const copyPrint:(print:Print)=>Print =
  (print) => ({front:copyFace(print.front), back:copyFace(print.back)});
export const copyPrintMap:(printMap:PrintMap)=>PrintMap =
  (printMap) => {
    const next = new Map<string, Print>();
    printMap.forEach((print, id) => next.set(id, copyPrint(print)));
    return next;
  };
export const copyImageMap:(imageMap:ImageMap)=>ImageMap =
  (imageMap) => {
    const next = new Map<string, PrintMap>();
    imageMap.forEach((printMap, oracleId) => next.set(oracleId, copyPrintMap(printMap)));
    return next;
  };