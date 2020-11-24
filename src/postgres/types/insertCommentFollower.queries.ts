/** Types generated for queries found in "src/postgres/inserts/insertCommentFollower.ts" */

/** 'Query' parameters type */
export interface IQueryParams {
  followerAccount: string | null | void;
  followingCommentId: bigint | null | void;
}

/** 'Query' return type */
export interface IQueryResult {
  follower_account: string;
  following_comment_id: bigint;
}

/** 'Query' query type */
export interface IQueryQuery {
  params: IQueryParams;
  result: IQueryResult;
}

