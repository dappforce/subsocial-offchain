import { SubstrateId } from '@subsocial/types/substrate/interfaces/utils'
import { bnToHex } from '@polkadot/util'
import { newLogger } from '@subsocial/utils';

const log = newLogger('Substrate Utils')

require('dotenv').config();

// gets the event sections to filter on
// if not set in the .env file then all events are processed
export const getEventSections = () => {
  const sections = process.env.SUBSTRATE_EVENT_SECTIONS;
  if (sections) {
    return sections.split(',');
  } else {
    return [ 'all' ];
  }
};

export const getEventMethods = () => {
  const methods = process.env.SUBSTRATE_EVENT_METHODS;
  if (methods) {
    return methods.split(',');
  } else {
    return [ 'all' ];
  }
};

export function encodeStructIds (ids: SubstrateId[]) {
  try {
    return ids.map(encodeStructId
  } catch (err) {
    log.error('Failed to encode struct ids:', err)
    return []
  }
}

/**
 * Convert a number to its shortened hex representation.
 * Example: '0x000012ab' -> '12ab'
 */
export function encodeStructId (id: SubstrateId): string {
  return bnToHex(id).split('x')[1].replace(/(0+)/, '');
}
