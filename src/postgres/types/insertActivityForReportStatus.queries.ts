/** Types generated for queries found in "src/postgres/inserts/insertActivityForAccount.ts" */
import { action } from '../utils';
import { Dayjs } from 'dayjs'

/** 'Query' parameters type */
export interface IQueryParams {
  blockNumber: bigint | null | void;
  eventIndex: number | null | void;
  account: string | null | void;
  followingId: string | null | void;
  spaceId: bigint | null | void;
  postId: bigint | null | void;
  event: action | null | void;
  scopeId: bigint | null | void;
  date: Dayjs | null | void;
}

/** 'QueryUpdate' parameters type */
export interface IQueryUpdateParams {
  blockNumber: bigint | null | void;
  eventIndex: number | null | void;
  event: action | null | void;
  reportId: bigint | null | void;
  scopeId: bigint | null | void;
}

