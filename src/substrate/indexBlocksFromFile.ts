import { resolveSubsocialApi } from "../connections"
import { newLogger } from '@subsocial/utils';
import { indexBlocksFromFile } from './block-indexer';

const log = newLogger('BlockIndexer')

resolveSubsocialApi()
  .then(({ substrate }) => indexBlocksFromFile(substrate))
  .catch((error) => {
    log.error('Unexpected error during processing of Substrate events:', error)
    process.exit(-1)
  })