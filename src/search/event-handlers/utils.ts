import { ES_INDEX_SPACES, ES_INDEX_PROFILES, ES_INDEX_POSTS } from '../config';
import { Space, Profile, Post } from '@subsocial/types/substrate/interfaces';
import { indexContentFromIpfs } from '../indexer';
import { resolveCidOfContent } from '@subsocial/api/utils';

export const indexSpaceContent = (space: Space) => indexContentFromIpfs(ES_INDEX_SPACES, resolveCidOfContent(space.content), space.id)
export const indexProfileContent = (profile: Profile) => indexContentFromIpfs(ES_INDEX_PROFILES, resolveCidOfContent(profile.content), profile.created.account);
export const indexPostContent = (post: Post) => indexContentFromIpfs(ES_INDEX_POSTS, resolveCidOfContent(post.content), post.id, post)