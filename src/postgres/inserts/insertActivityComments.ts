import { SubstrateId } from '@subsocial/types';
import { SubstrateEvent } from '../../substrate/types';
import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../connections/subsocial';
import { log } from '../postges-logger';
import { insertNotificationForOwner } from './insertNotificationForOwner';
import { insertActivityForComment } from './insertActivityForComment';

export async function insertActivityComments(eventAction: SubstrateEvent, ids: SubstrateId[], lastComment: Post) {
  let comment = lastComment;
  const lastCommentAccount = lastComment.created.account.toString();

  // TODO find all replies and insert into DB with a single query:
  while (comment.extension.asComment.parent_id.isSome) {
    log.debug('parent_id is defined')
    const id = comment.extension.asComment.parent_id.unwrap();
    const param = [...ids, id];
    const parentComment = await substrate.findPost({ id });

    if (parentComment) {
      comment = parentComment;
    }

    const account = comment.created.account.toString();
    const insertResult = await insertActivityForComment(eventAction, param, account);

    if (account === lastCommentAccount) return;
    await insertNotificationForOwner({ ...insertResult, account });
  }
};