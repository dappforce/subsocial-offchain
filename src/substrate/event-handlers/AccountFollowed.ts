import { substrate } from '../server';
import { insertAccountFollower } from '../../postgres/insert-follower';
import { insertActivityForAccount } from '../../postgres/insert-activity';
import { insertNotificationForOwner } from '../../postgres/notifications';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK, HandlerResultErrorInPostgres } from '../types';
import { newLogger } from '@subsocial/utils';

export const onAccountFollowed: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  try {
    await insertAccountFollower(data);
    const account = data[1].toString()
    const socialAccount = await substrate.findSocialAccount(account)
    if (!socialAccount) return HandlerResultOK

    const count = socialAccount.followers_count.toNumber() - 1;
    const id = await insertActivityForAccount(eventAction, count);
    if (id === -1) return HandlerResultOK

    const following = data[1].toString();
    await insertNotificationForOwner(id, following);
  } catch (err) {
    log.error('Failed to process event for Postgres:', err)
    return HandlerResultErrorInPostgres(err)
  }
  return HandlerResultOK
}

const log = newLogger(onAccountFollowed.name)
