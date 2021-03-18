import { readFile, writeFile, mkdir } from 'fs';
import { join } from 'path';
import { promisify } from 'util'

export const stateDirPath = join(__dirname, '../state')

export const asyncReadFile = promisify(readFile)
export const asyncWriteFile = promisify(writeFile)
export const asyncMkdir = promisify(mkdir)