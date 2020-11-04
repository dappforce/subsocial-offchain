import { substrate } from '../../connections/subsocial';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import AccountId from '@polkadot/types/generic/AccountId';
import { indexProfileContent } from './utils';

export const onProfileUpdated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const accountId = data[0] as AccountId;
  const socialAccount = await substrate.findSocialAccount(accountId)
  if (!socialAccount) return;

  const profileOpt = socialAccount.profile;
  if (profileOpt.isNone) return;

  const profile = profileOpt.unwrapOr(undefined);
  await indexProfileContent(profile);
}
