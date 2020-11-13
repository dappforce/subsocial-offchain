const { resolveSubsocialApi } = require('./connections/subsocial')
const { writeFileSync } = require('fs')

const getData = async () => {
  const { substrate } = await resolveSubsocialApi()

  const spacesEntry = await (await substrate.api).query.spaces.spaceById.entries()

  const spaces = spacesEntry.map(x => JSON.parse(x[1])).filter(x => x.id > 1000)
  writeFileSync('./spaces.json', JSON.stringify(spaces))


  const postEntry = await (await substrate.api).query.posts.postById.entries()

  const posts = postEntry.map(x => JSON.parse(x[1]))
  writeFileSync('./posts.json', JSON.stringify(posts))


  const profilesEntry = await (await substrate.api).query.spaces.spaceById.entries()

  const profiles = profilesEntry.map(x => JSON.parse(x[1]))
  writeFileSync('./profiles.json', JSON.stringify(profiles))

  process.exit(0)
}

getData()