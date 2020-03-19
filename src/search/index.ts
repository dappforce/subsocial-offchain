import searchClient from '../adaptors/connectElasticsearch'
import * as BlogsMapping from './mappings/blogs.json'
import * as PostsMapping from './mappings/posts.json'
import * as CommentsMapping from './mappings/comments.json'
import * as ProfilesMapping from './mappings/profiles.json'
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_COMMENTS, ES_INDEX_PROFILES } from './indexes'

async function run () {
  await insertSearchIndexIfNotExist(ES_INDEX_BLOGS, BlogsMapping)
  await insertSearchIndexIfNotExist(ES_INDEX_POSTS, PostsMapping)
  await insertSearchIndexIfNotExist(ES_INDEX_COMMENTS, CommentsMapping)
  await insertSearchIndexIfNotExist(ES_INDEX_PROFILES, ProfilesMapping)
}

async function insertSearchIndexIfNotExist (name: string, body: any) {
  const result = await searchClient.indices.exists({
    index: name
  }, { ignore: [ 404 ] })

  if (result.statusCode === 404) {
    await searchClient.indices.create({
      index: name,
      body: body
    })
    console.log('\'' + name + '\' index created')
  } else console.log('\'' + name + '\' index already exists')
}

run().catch(console.log)
