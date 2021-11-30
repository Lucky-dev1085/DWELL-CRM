import _api from './api';
import _client from './client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const build = (path: string, ...params: any): string => {
  params.reverse();
  return path.replace(/(:\w+)\??/g, () => params.pop());
};

export const api = { v1: _api };
export const client = _client;

export default {
  api: { v1: _api },
  client,
  build,
};
