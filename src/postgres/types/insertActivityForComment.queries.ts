import * as BN from 'bn.js';
/** Types generated for queries found in "src/postgres/inserts/insertActivityForComment.ts" */
export type action = 'SpaceCreated' | 'SpaceUpdated' | 'SpaceFollowed' | 'SpaceUnfollowed' | 'AccountFollowed' | 'AccountUnfollowed' | 'PostCreated' | 'PostUpdated' | 'PostShared' | 'CommentCreated' | 'CommentUpdated' | 'CommentShared' | 'CommentDeleted' | 'CommentReplyCreated' | 'PostReactionCreated' | 'PostReactionUpdated' | 'CommentReactionCreated' | 'CommentReactionUpdated';

/** 'Query' parameters type */
export interface IQueryParams {
  blockNumber: BN | null | void;
  eventIndex: number | null | void;
  account: string | null | void;
  event: string | null | void;
  postId: bigint | null | void;
  commentId: bigint | null | void;
  parentCommentId: bigint | null | void;
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

/** 'QueryUpdateIfParentId' parameters type */
export interface IQueryUpdateIfParentIdParams {
  blockNumber: BN | null | void;
  eventIndex: number | null | void;
  event: string | null | void;
  postId: bigint | null | void;
  parentCommentId: bigint | null | void;
}

/** 'QueryUpdateIfParentId' return type */
export interface IQueryUpdateIfParentIdResult {
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

/** 'QueryUpdateIfParentId' query type */
export interface IQueryUpdateIfParentIdQuery {
  params: IQueryUpdateIfParentIdParams;
  result: IQueryUpdateIfParentIdResult;
}

/** 'QueryUpdateIfNotParentId' parameters type */
export interface IQueryUpdateIfNotParentIdParams {
  blockNumber: BN | null | void;
  eventIndex: number | null | void;
  event: string | null | void;
  postId: bigint | null | void;
  parentCommentId: bigint | null | void;
}

/** 'QueryUpdateIfNotParentId' return type */
export interface IQueryUpdateIfNotParentIdResult {
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

/** 'QueryUpdateIfNotParentId' query type */
export interface IQueryUpdateIfNotParentIdQuery {
  params: IQueryUpdateIfNotParentIdParams;
  result: IQueryUpdateIfNotParentIdResult;
}

