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