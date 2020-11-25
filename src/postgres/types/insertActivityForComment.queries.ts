/** Types generated for queries found in "src/postgres/inserts/insertActivityForComment.ts" */
export type action = 'SpaceCreated' | 'SpaceUpdated' | 'SpaceFollowed' | 'SpaceUnfollowed' | 'AccountFollowed' | 'AccountUnfollowed' | 'PostCreated' | 'PostUpdated' | 'PostShared' | 'CommentCreated' | 'CommentUpdated' | 'CommentShared' | 'CommentDeleted' | 'CommentReplyCreated' | 'PostReactionCreated' | 'PostReactionUpdated' | 'CommentReactionCreated' | 'CommentReactionUpdated';

/** 'Query' parameters type */
export interface IQueryParams {
  blockNumber: bigint | null | void;
  eventIndex: number | null | void;
  account: string | null | void;
  event: action | null | void;
  postId: bigint | null | void;
  commentId: bigint | null | void;
  parentCommentId: bigint | null | void;
  date: Date | null | void;
  aggCount: number | null | void;
  aggregated: boolean | null | void;
}

/** 'QueryUpdateIfParentId' parameters type */
export interface IQueryUpdateParams {
  blockNumber: bigint | null | void;
  eventIndex: number | null | void;
  event: action | null | void;
  postId: bigint | null | void;
  parentCommentId: bigint | null | void;
}