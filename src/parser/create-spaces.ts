import { About } from "./parse-medium"
import { readFileSync } from 'fs'
import { Keyring } from '@polkadot/keyring'
import { Api } from '@subsocial/api/substrateConnect'
import { OptionId, OptionText, IpfsContent } from '@subsocial/types/substrate/classes'
import ipfs from '../connections/connect-ipfs'

const spaces = JSON.parse(readFileSync('medium.json').toString())

const createSpaces = async (spaces: About[]) => {
  const substrateApi = await Api.connect(process.env.SUBSTRATE_URL)

  const properties = await substrateApi.rpc.system.properties()
  const keyring = new Keyring({ ss58Format: properties.ss58Format.unwrapOr(undefined)})
  
  const alice = keyring.addFromUri('//Alice');

  console.log('alice', alice.address)


  // const ipfs = new SubsocialIpfsApi({ ipfsNodeUrl: process.env.IPFS_NODE_URL, offchainUrl: `localhost:3001`})

  console.log('ipfs', ipfs)

  const paramsPromises = spaces.map(async ({ image, about, name, handle }) => {
    const cid = await ipfs.saveSpace({ desc: about, name, image, tags: [] })
    console.log('cid', cid)
    return [ new OptionId(), new OptionText(handle), new IpfsContent(cid) ]
  })

  const params = await Promise.all(paramsPromises)

  const txs = params.map(params => substrateApi.tx.spaces.createSpace(...params).signAndSend(alice, ({ status }) => {
    if (status.isInBlock) {
      console.log(`included in ${status.asInBlock}`);
    }
  }))

  await Promise.all(txs)

  // substrateApi.tx.utility
  // .batch(txs)
  // .signAndSend(alice, ({ status }) => {
  //   if (status.isInBlock) {
  //     console.log(`included in ${status.asInBlock}`);
  //   }
  // });
}

createSpaces(spaces)