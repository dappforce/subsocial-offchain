import { GenericAccountId } from '@polkadot/types';
import { writeFileSync } from 'fs';
import { resolveSubsocialApi } from '../connections/subsocial';
import { normalizeSpaceStruct, normalizePostStruct, normalizeProfileStruct } from './normalizers';
import { Space, Post, SocialAccount } from '@subsocial/types/substrate/interfaces';
import { Option } from '@polkadot/types/codec';

function writeStorageInFile(storageName, storage) { 
  writeFileSync(`../../../test/input_data/${storageName}.json`, JSON.stringify(storage, null, 2))
}

const getData = async () => {
  const { substrate } = await resolveSubsocialApi()

  const spaceEntries = await (await substrate.api).query.spaces.spaceById.entries() as unknown as [string, Option<Space>][]

  const spacesStore = {}
  const postStore = {}
  const profileStore = {}

  spaceEntries
    .forEach(([_id, spaceOpt]) => {
      if(spaceOpt.isSome) {
        const space = normalizeSpaceStruct(spaceOpt.unwrap())
        if(space.contentId || space.handle) {
          spacesStore[space.id] = space
        }
      }
    })

  writeStorageInFile("spaces", spacesStore)

  const postEntries = await (await substrate.api).query.posts.postById.entries() as unknown as [string, Option<Post>][]

  postEntries
    .forEach(([_id, postObj]) => {
      if(postObj.isSome) {
        const post = normalizePostStruct(postObj.unwrap())
        if(post.contentId){
          postStore[post.id] = post
        }
      }
    })
  writeStorageInFile("posts", postStore)

  const profileEntries = await (await substrate.api).query.profiles.socialAccountById.entries() as unknown as [any, Option<SocialAccount>][]

  profileEntries.forEach(([ key, socialAccount ]) => {
    const addressEncoded = '0x' + key.toHex().substr(-64)
    const account = new GenericAccountId(key.registry, addressEncoded)
    const profile = normalizeProfileStruct(account, socialAccount.unwrap())
    profileStore[profile.id] = profile
  })
  writeStorageInFile("profiles", profileStore)
  
  process.exit(0)
}

getData()