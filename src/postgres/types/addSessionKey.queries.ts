import { Protocol } from './sessionKey';

export interface IQueryParams {
  mainKey: string | null | void;
  sessionKey: string | null | void;
  protocol: Protocol | null | void;
}