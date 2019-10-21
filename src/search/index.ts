import searchClient from '../adaptors/connectElasticsearch'
import * as BlogsMapping from './mappings/blogs.json' 
import * as PostsMapping from './mappings/posts.json' 
import * as CommentsMapping from './mappings/comments.json' 
import * as ProfilesMapping from './mappings/profiles.json' 

async function run() {
  await insertSearchIndex('subsocial_blogs', BlogsMapping)
  await insertSearchIndex('subsocial_posts', PostsMapping)
  await insertSearchIndex('subsocial_comments', CommentsMapping)
  await insertSearchIndex('subsocial_profiles', ProfilesMapping)
}

async function insertSearchIndex(name: string, body: any) {
  await searchClient.indices.create({
    index: name,
    body: body
  })
}

run().catch(console.log)