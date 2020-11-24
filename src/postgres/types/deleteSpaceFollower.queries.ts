/** Types generated for queries found in "src/postgres/deletes/deleteSpaceFollower.ts" */

/** 'Query' parameters type */
export interface IQueryParams {
  followerAccount: string | null | void;
  followingSpaceId: bigint | null | void;
}

/** 'Query' return type */
export interface IQueryResult {
  follower_account: string;
  following_space_id: bigint;
}

/** 'Query' query type */
export interface IQueryQuery {
  params: IQueryParams;
  result: IQueryResult;
}

