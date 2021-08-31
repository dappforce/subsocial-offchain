import { SpaceId, PostId } from '@subsocial/types/substrate/interfaces';
import { readFileSync } from 'fs';
import { resolveSubsocialApi } from '../connections/subsocial';

import { Id, NormalizedPost, NormalizedProfile, NormalizedSpace, normalizeSpaceStruct, normalizePostStruct, normalizeProfileStruct } from './normalizers';
import { AccountId } from '@polkadot/types/interfaces'
import { TEST_MODE } from '../env';
import BN from 'bn.js';

type StorageName = 'posts' | 'spaces' | 'profiles'

type Storage = {
  spaces: Record<Id , NormalizedSpace>,
  posts: Record<Id, NormalizedPost>,
  profiles: Record<Id, NormalizedProfile>,
}

let storage: Storage

function initStorage() {
  if (TEST_MODE && !storage) {
    storage = {
      spaces: readStorageFromFile('spaces'),
      posts: readStorageFromFile('posts'),
      profiles: readStorageFromFile('profiles'),
    }
  }
}

initStorage()

function readStorageFromFile <T>(storageName: StorageName): Record<Id, T> {
  return JSON.parse(readFileSync(`./test/input_data/${storageName}.json`, 'utf-8'))
}

export async function findSpace(id: SpaceId | string): Promise<NormalizedSpace | undefined> {
  if (TEST_MODE) {
    return storage.spaces[id.toString()]
  }
  else {
    const { substrate } = await resolveSubsocialApi()
    const space = await substrate.findSpace({ id: new BN(id) })
    return normalizeSpaceStruct(space)
  }
}

export async function findPost(id: PostId | string): Promise<NormalizedPost | undefined> {
  if (TEST_MODE) {
    return storage.posts[id.toString()]
  }
  else {
    const { substrate } = await resolveSubsocialApi()
    const post = await substrate.findPost({ id: new BN(id) })
    return normalizePostStruct(post)
  }
}

export async function findSocialAccount(id: AccountId | string): Promise<NormalizedProfile | undefined> {
  if (TEST_MODE) {
    return storage.profiles[id.toString()]
  }
  else {
    const { substrate } = await resolveSubsocialApi()
    const profile = await substrate.findSocialAccount(id)
    return normalizeProfileStruct(id, profile)
  }
}