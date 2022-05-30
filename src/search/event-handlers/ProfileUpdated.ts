import { EventHandlerFn } from '../../substrate/types';
import { AccountId } from '@polkadot/types/interfaces'
import { indexProfileContent } from '../indexer';
import { findSocialAccount } from '../../substrate/api-wrappers';

export const onProfileUpdated: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  const accountId = data[0] as AccountId;

  const socialAccount = await findSocialAccount(accountId)
  if (!socialAccount.contentId) return;

  await indexProfileContent(socialAccount);
}
