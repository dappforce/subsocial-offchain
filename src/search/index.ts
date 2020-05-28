import elastic from '../connections/connect-elasticsearch'
import * as BlogsMapping from './mappings/blogs.json'
import * as PostsMapping from './mappings/posts.json'
import * as ProfilesMapping from './mappings/profiles.json'
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_PROFILES } from './config'
import { elasticLog as log } from '../connections/loggers';

async function maybeCreateIndices () {
  await createIndexIfNoFound(ES_INDEX_BLOGS, BlogsMapping)
  await createIndexIfNoFound(ES_INDEX_POSTS, PostsMapping)
  await createIndexIfNoFound(ES_INDEX_PROFILES, ProfilesMapping)
}

async function createIndexIfNoFound (indexName: string, mapping: any) {
  const result = await elastic.indices.exists(
    { index: indexName },
    { ignore: [ 404 ] }
  )

  if (result.statusCode === 404) {
    await elastic.indices.create({
      index: indexName,
      body: mapping
    })
    log.info(`${indexName} index created`)
  } else log.warn(`${indexName} index already exists`)
}

maybeCreateIndices()
  .catch(err => {
    log.error('Failed to create indices:', err)
    throw err
  })
