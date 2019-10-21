import searchClient from '../adaptors/connectElasticsearch'
import * as BlogsMapping from './mappings/blogs.json'
import * as PostsMapping from './mappings/posts.json'
import * as CommentsMapping from './mappings/comments.json'
import * as ProfilesMapping from './mappings/profiles.json'

async function run() {
  await insertSearchIndexIfNotExist('subsocial_blogs', BlogsMapping)
  await insertSearchIndexIfNotExist('subsocial_posts', PostsMapping)
  await insertSearchIndexIfNotExist('subsocial_comments', CommentsMapping)
  await insertSearchIndexIfNotExist('subsocial_profiles', ProfilesMapping)
}

async function insertSearchIndexIfNotExist(name: string, body: any) {
  const result = await searchClient.indices.exists({
    index: name
  }, { ignore: [404] })

  if (result.statusCode == 404) {
    await searchClient.indices.create({
      index: name,
      body: body
    })
    console.log('\'' + name + '\' index created')
  } else console.log('\'' + name + '\' index already exists')
}

run().catch(console.log)