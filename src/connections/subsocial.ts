import { SubsocialIpfsApi } from '@subsocial/api/ipfs'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { SubsocialSubstrateApi } from '@subsocial/api/substrate'
import { Api } from '@subsocial/api/substrateConnect'
import { ipfsConfig } from './ipfs'
import { readFileSync } from 'fs';
import { Post, SocialAccount, Space } from '@subsocial/types/substrate/interfaces';

export let subsocial: SubsocialApi
export let substrate: SubsocialSubstrateApi
export let ipfs: SubsocialIpfsApi

const createMockSubstrate = (): SubsocialSubstrateApi => {
  const postById: Record<string, Post> = JSON.parse(readFileSync('../test/input_data/posts.json', 'utf-8'))
  const spaceById: Record<string, Space> = JSON.parse(readFileSync('../test/input_data/spaces.json.json', 'utf-8'))
  const profileByAccount: Record<string, SocialAccount> = JSON.parse(readFileSync('../test/input_data/profiles.json.json', 'utf-8'))

  return {
    findPost: async ({ id }) => postById[id.toString()],
    findSpace: async ({ id }) => spaceById[id.toString()],
    findSocialAccount: async (id) => profileByAccount[id.toString()]
  } as SubsocialSubstrateApi
}
/**
 * Create a new or return existing connection to Subsocial API
 * (includes Substrate and IPFS connections).
 */
export const resolveSubsocialApi = async () => {
  // Connect to Subsocial's Substrate node:
  if (process.env.TEST_MODE?.toLocaleLowerCase() === 'true') {
    return {
      substrate: createMockSubstrate()
    }
  }

  if (!subsocial) {
    const api = await Api.connect(process.env.SUBSTRATE_URL)
    subsocial = new SubsocialApi({
      substrateApi: api,
      ...ipfsConfig
    })

    substrate = subsocial.substrate
    ipfs = subsocial.ipfs
  }

  return subsocial
}
