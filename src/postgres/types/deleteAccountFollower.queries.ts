/** Types generated for queries found in "src/postgres/deletes/deleteAccountFollower.ts" */

/** 'Query' parameters type */
export interface IQueryParams {
  followerAccount: string | null | void;
  followingAccount: string | null | void;
}

/** 'Query' return type */
export interface IQueryResult {
  follower_account: string;
  following_account: string;
}

/** 'Query' query type */
export interface IQueryQuery {
  params: IQueryParams;
  result: IQueryResult;
}

