import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_PROFILES } from '../../search/config';
import { AccountId } from '@subsocial/types/substrate/interfaces/runtime';
import { substrate } from '../server';
import { SubstrateEvent } from '../types';

export const onProfileUpdated = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const accountId = data[0] as AccountId;
  const socialAccount = await substrate.findSocialAccount(accountId)
  if (!socialAccount) return;

  const profileOpt = socialAccount.profile;
  if (profileOpt.isNone) return;

  const profile = profileOpt.unwrap();
  indexContentFromIpfs(ES_INDEX_PROFILES, profile.ipfs_hash.toString(), accountId, { username: profile.username.toString() });
}
