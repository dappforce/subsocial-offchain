/** Types generated for queries found in "src/postgres/inserts/insertActivityForPost.ts" */
import { action } from '../utils';

/** 'Query' parameters type */
export interface IQueryParams {
  blockNumber: bigint | null | void;
  eventIndex: number | null | void;
  account: string | null | void;
  event: action | null | void;
  spaceId: bigint | null | void;
  postId: bigint | null | void;
  date: Date | null | void;
  aggCount: number | null | void;
}