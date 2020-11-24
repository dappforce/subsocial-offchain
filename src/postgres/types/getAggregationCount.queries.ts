/** Types generated for queries found in "src/postgres/selects/getAggregationCount.ts" */
export type action = 'SpaceCreated' | 'SpaceUpdated' | 'SpaceFollowed' | 'SpaceUnfollowed' | 'AccountFollowed' | 'AccountUnfollowed' | 'PostCreated' | 'PostUpdated' | 'PostShared' | 'CommentCreated' | 'CommentUpdated' | 'CommentShared' | 'CommentDeleted' | 'CommentReplyCreated' | 'PostReactionCreated' | 'PostReactionUpdated' | 'CommentReactionCreated' | 'CommentReactionUpdated';

/** 'Query' parameters type */
export interface IQueryParams {
  account: string | null | void;
  event: string | null | void;
  postId: bigint | null | void;
}

/** 'Query' return type */
export interface IQueryResult {
  count: string | null;
}

/** 'Query' query type */
export interface IQueryQuery {
  params: IQueryParams;
  result: IQueryResult;
}

