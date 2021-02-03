import { EventHandlerFn } from '../../substrate/types';
import { AccountId } from '@polkadot/types/interfaces'
import { indexProfileContent } from '../indexer';
import { resolveSubsocialApi } from '../../connections';

export const onProfileCreated: EventHandlerFn = async (eventAction) => {
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
