import searchClient from '../adaptors/connect-elasticsearch'
import * as BlogsMapping from './mappings/blogs.json'
import * as PostsMapping from './mappings/posts.json'
import * as CommentsMapping from './mappings/comments.json'
import * as ProfilesMapping from './mappings/profiles.json'
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_COMMENTS, ES_INDEX_PROFILES } from './indexes'
import { searchLog as log } from '../adaptors/loggers';

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
    log.info(`'${name}' index created`)
  } else log.warn(`${name} index already exists`)
}

run().catch(err => log.error(err))
