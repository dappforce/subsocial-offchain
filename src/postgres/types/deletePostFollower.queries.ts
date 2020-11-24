/** Types generated for queries found in "src/postgres/deletes/deletePostFollower.ts" */

/** 'Query' parameters type */
export interface IQueryParams {
  followerAccount: string | null | void;
  followingPostId: bigint | null | void;
}

/** 'Query' return type */
export interface IQueryResult {
  follower_account: string;
  following_post_id: bigint;
}

/** 'Query' query type */
export interface IQueryQuery {
  params: IQueryParams;
  result: IQueryResult;
}

