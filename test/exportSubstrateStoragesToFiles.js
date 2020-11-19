const { resolveSubsocialApi } = require('../build/src/connections/subsocial')
const { writeFileSync } = require('fs')
const { GenericAccountId } = require('@polkadot/types/generic')
const { normalizeSpaceStruct, normalizePostStruct, normalizeProfileStruct } = require('../build/src/substrate/normalizers')

function writeStorageInFile(storageName, storage) { 
  writeFileSync(`./test/input_data/${storageName}.json`, JSON.stringify(storage, null, 2))
}

const getData = async () => {
  const { substrate } = await resolveSubsocialApi()

  const spaceEntries = await (await substrate.api).query.spaces.spaceById.entries()

  const spacesStore = {}
  const postStore = {}
  const profileStore = {}

  const spaces = spaceEntries
    .forEach(([id, spaceOpt]) => {
      if(spaceOpt.isSome) {
        const space = normalizeSpaceStruct(spaceOpt.unwrap())
        if(space.contentId || space.handle) {
          spacesStore[space.id] = space
        }
      }
    })

  writeStorageInFile("spaces", spacesStore)

  const postEntries = await (await substrate.api).query.posts.postById.entries()

  const posts = postEntries
    .forEach(([id, postObj]) => {
      if(postObj.isSome) {
        const post = normalizePostStruct(postObj.unwrap())
        if(post.contentId){
          postStore[post.id] = post
        }
      }
    })
  writeStorageInFile("posts", postStore)

  const profileEntries = await (await substrate.api).query.profiles.socialAccountById.entries()

  const profiles = profileEntries.forEach(([ key, socialAccount ]) => {
    const addressEncoded = '0x' + key.toHex().substr(-64)
    const account = new GenericAccountId(key.registry, addressEncoded)
    const profile = normalizeProfileStruct(account, socialAccount.unwrap())
    profileStore[profile.id] = profile
  })
  writeStorageInFile("profiles", profileStore)
  
  process.exit(0)
}

getData()