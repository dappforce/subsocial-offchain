import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'fs'
import { toSubsocialAddress } from '@subsocial/utils';

export const parseJsonFromState = (sourcePath: string, fileName: string) => {
  const path = join(sourcePath, fileName)

  if (!existsSync(path)) return []

  return JSON.parse(readFileSync(path).toString())
}

export const readSources = (sourcePath) => {
  if (!existsSync(sourcePath)) {
    mkdirSync(sourcePath)
  }

  const files = readdirSync(sourcePath)

  return files.flatMap((file) => parseJsonFromState(sourcePath, file))
}

export const withSubsocialAddress = <T>(fn: (key: string) => T) => {
  return (account: string) => {
    const key = toSubsocialAddress(account)

    return fn(key)
  }
}