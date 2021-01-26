import { resolveSubsocialApi } from '../../connections/subsocial';
import { EventHandlerFn } from '../../substrate/types';
import AccountId from '@polkadot/types/generic/AccountId';
import { indexProfileContent } from '../indexer';

export const onProfileUpdated: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  const accountId = data[0] as AccountId;

  const { substrate } = await resolveSubsocialApi()

  const socialAccount = await substrate.findSocialAccount(accountId)
  if (!socialAccount) return;

  const profileOpt = socialAccount.profile;
  if (profileOpt.isNone) return;

  const profile = profileOpt.unwrapOr(undefined);
  await indexProfileContent(profile);
}
