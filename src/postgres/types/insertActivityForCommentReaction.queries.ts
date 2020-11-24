import * as BN from 'bn.js';
/** Types generated for queries found in "src/postgres/inserts/insertActivityForCommentReaction.ts" */
export type action = 'SpaceCreated' | 'SpaceUpdated' | 'SpaceFollowed' | 'SpaceUnfollowed' | 'AccountFollowed' | 'AccountUnfollowed' | 'PostCreated' | 'PostUpdated' | 'PostShared' | 'CommentCreated' | 'CommentUpdated' | 'CommentShared' | 'CommentDeleted' | 'CommentReplyCreated' | 'PostReactionCreated' | 'PostReactionUpdated' | 'CommentReactionCreated' | 'CommentReactionUpdated';

/** 'Query' parameters type */
export interface IQueryParams {
  blockNumber: BN | null | void;
  eventIndex: number | null | void;
  account: string | null | void;
  event: string | null | void;
  postId: bigint | null | void;
  commentId: bigint | null | void;
  date: Date | null | void;
  aggCount: number | null | void;
  aggregated: boolean | null | void;
}

/** 'Query' return type */
export interface IQueryResult {
  account: string;
  block_number: BN;
  event_index: number;
  event: string;
  following_id: bigint | null;
  space_id: bigint | null;
  post_id: bigint | null;
  comment_id: bigint | null;
  parent_comment_id: bigint | null;
  date: Date;
  aggregated: boolean;
  agg_count: number;
}

/** 'Query' query type */
export interface IQueryQuery {
  params: IQueryParams;
  result: IQueryResult;
}

/** 'QueryUpdate' parameters type */
export interface IQueryUpdateParams {
  blockNumber: BN | null | void;
  eventIndex: number | null | void;
  event: string | null | void;
  postId: bigint | null | void;
  commentId: bigint | null | void;
}

/** 'QueryUpdate' return type */
export interface IQueryUpdateResult {
  account: string;
  block_number: BN;
  event_index: number;
  event: string;
  following_id: bigint | null;
  space_id: bigint | null;
  post_id: bigint | null;
  comment_id: bigint | null;
  parent_comment_id: bigint | null;
  date: Date;
  aggregated: boolean;
  agg_count: number;
}

/** 'QueryUpdate' query type */
export interface IQueryUpdateQuery {
  params: IQueryUpdateParams;
  result: IQueryUpdateResult;
}

