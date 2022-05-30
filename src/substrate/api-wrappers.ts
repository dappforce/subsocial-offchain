import { SpaceId, PostId } from '@subsocial/types/substrate/interfaces';
import { readFileSync } from 'fs';

import { Id, NormalizedPost, NormalizedProfile, NormalizedSpace } from './normalizers';
import { AccountId } from '@polkadot/types/interfaces'
import { TEST_MODE } from '../env';
import { rpcApi } from '../connections/rpc';

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
    const space = await rpcApi.getSpaceById(id.toString())
    return space
  }
}

export async function findPost(id: PostId | string): Promise<NormalizedPost | undefined> {
  if (TEST_MODE) {
    return storage.posts[id.toString()]
  }
  else {
    const post = await rpcApi.getPostById(id.toString())

    if (!post) return undefined

    return {
      ...post,
      ownerId: post.owner
    }
  }
}

export async function findSocialAccount(id: AccountId | string): Promise<NormalizedProfile | undefined> {
  if (TEST_MODE) {
    return storage.profiles[id.toString()]
  }
  else {
    const { profile, ...socialAccount } = await rpcApi.getSocialAccountById(id.toString()) || {}

    return {
      ...socialAccount,
      ...profile
    }
  }
}