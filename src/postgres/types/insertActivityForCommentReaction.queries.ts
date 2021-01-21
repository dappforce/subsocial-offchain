/** Types generated for queries found in "src/postgres/inserts/insertActivityForCommentReaction.ts" */
import { action } from '../utils';
import { Dayjs } from 'dayjs'

/** 'Query' parameters type */
export interface IQueryParams {
  blockNumber: bigint | null | void;
  eventIndex: number | null | void;
  account: string | null | void;
  event: action | null | void;
  postId: bigint | null | void;
  commentId: bigint | null | void;
  date: Dayjs | null | void;
  aggCount: number | null | void;
  aggregated: boolean | null | void;
}

/** 'QueryUpdate' parameters type */
export interface IQueryUpdateParams {
  blockNumber: bigint | null | void;
  eventIndex: number | null | void;
  event: action | null | void;
  postId: bigint | null | void;
  commentId: bigint | null | void;
}