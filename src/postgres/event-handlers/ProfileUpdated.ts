import { substrate } from '../../substrate/subscribe';
import { SubstrateEvent } from '../../substrate/types';
import { upsertProfile } from '../upsert-profile';

export const onProfileUpdated = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction

  const account = data[0].toString();
  const socialAccount = await substrate.findSocialAccount(account)
  const profile = socialAccount.profile.unwrapOr(undefined)
  if(!profile) return

  await upsertProfile(profile)
}