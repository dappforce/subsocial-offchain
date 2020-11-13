const { resolveSubsocialApi } = require('../../../build/src/connections/subsocial')
const { writeFileSync } = require('fs')
const { GenericAccountId } = require('@polkadot/types/generic')

const getData = async () => {
  const { substrate } = await resolveSubsocialApi()

  const spacesEntry = await (await substrate.api).query.spaces.spaceById.entries()

  const spacesStore = {}
  const postStore = {}
  const profileStore = {}
  const spaces = spacesEntry.map(x => JSON.parse(x[1])).filter(x => x.id > 1000).forEach(x => { spacesStore[x.id] = x })
  writeFileSync('./spaces.json', JSON.stringify(spacesStore))

  const postEntry = await (await substrate.api).query.posts.postById.entries()

  const posts = postEntry.map(x => JSON.parse(x[1])).forEach(x => { postStore[x.id] = x })
  writeFileSync('./posts.json', JSON.stringify(postStore))


  const profilesEntry = await (await substrate.api).query.profiles.socialAccountById.entries()
    
  const profiles = profilesEntry.forEach(([ key, socialAccount ]) => {
    const addressEncoded = '0x' + key.toHex().substr(-64)
    const account = new GenericAccountId(key.registry, addressEncoded)
    profileStore[account] = JSON.parse(socialAccount)
  })
  writeFileSync('./profiles.json', JSON.stringify(profileStore))

  process.exit(0)
}

getData()