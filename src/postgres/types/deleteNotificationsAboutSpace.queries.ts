/** Types generated for queries found in "src/postgres/deletes/deleteNotificationsAboutSpace.ts" */

/** 'Query' parameters type */
export interface IQueryParams {
  account: string | null | void;
  spaceId: bigint | null | void;
}

/** 'Query' return type */
export interface IQueryResult {
  account: string;
  block_number: string;
  event_index: number;
}

/** 'Query' query type */
export interface IQueryQuery {
  params: IQueryParams;
  result: IQueryResult;
}

