export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  return array.reduce(
    ([pass, fail], item) => {
      (predicate(item) ? pass : fail).push(item);
      return [pass, fail];
    },
    [[], []] as [T[], T[]]
  );
}

export function findAllIndices(str: string, substr: string): number[] {
  if (substr.length === 0) return [];
  const indices: number[] = [];
  let i = str.indexOf(substr);
  while (i !== -1) {
    indices.push(i);
    i = str.indexOf(substr, i + substr.length);
  }
  return indices;
}