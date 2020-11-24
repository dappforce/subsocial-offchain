/** Types generated for queries found in "src/postgres/selects/getCountOfUnreadNotifications.ts" */

/** 'Query' parameters type */
export interface IQueryParams {
  account: string | null | void;
}

/** 'Query' return type */
export interface IQueryResult {
  unread_count: string;
}

/** 'Query' query type */
export interface IQueryQuery {
  params: IQueryParams;
  result: IQueryResult;
}

