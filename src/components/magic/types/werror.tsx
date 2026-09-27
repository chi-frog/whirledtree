export enum WErrorCode {
  NO_ERROR = 'no_error',
  NOT_FOUND = 'not_found',
  GENERAL = 'general',
}
export type WError = {
  code:WErrorCode,
  info?:any,
}
export const _noError = {
  code:WErrorCode.NO_ERROR,
};
export const _notFound = (info:any) =>
  ({code:WErrorCode.NOT_FOUND, info});
export const _err = (err:any) =>
  ({code:WErrorCode.GENERAL, err});

export const isError = (err:WError) => (err.code !== WErrorCode.NO_ERROR);