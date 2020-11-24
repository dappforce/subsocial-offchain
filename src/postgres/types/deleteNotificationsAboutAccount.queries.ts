/** Types generated for queries found in "src/postgres/deletes/deleteNotificationsAboutAccount.ts" */

/** 'Query' parameters type */
export interface IQueryParams {
  account: string | null | void;
  activitiesAccount: string | null | void;
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

