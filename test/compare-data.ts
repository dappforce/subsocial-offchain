import { readFileSync } from 'fs'
import { createHash  } from 'crypto'
import * as chalk from 'chalk'
import { Parser } from 'json2csv'

export type SelectFromTableFn = () => Promise<any[]>

export type ComparsionResult = {
  inputData: string
  outputData: string
  msg: string
}

const hash = (file: string) => createHash('md5').update(file).digest('hex')

const parseCSVLikeString = (file: string) => {
  const data = JSON.parse(file);
  const parser = new Parser();
  return parser.parse(data).replace(/"/g, '');
}

export const compareData = async(resultFileName: string, getQueryDataFn: SelectFromTableFn): Promise<ComparsionResult> => {
  const outputData = readFileSync('./test/output_data/' + resultFileName, 'utf-8').replace(/;/g, ',')

  const inputData = await getQueryDataFn()

  let parsedInputData = ''

  if(inputData.length != 0)
    parsedInputData = parseCSVLikeString(JSON.stringify(inputData))

  const outputDataHash = hash(outputData)
  const parsedDataHash = hash(parsedInputData)

  let msg = ''
  if(parsedDataHash !== outputDataHash)
    msg = compareParsedSting(parsedInputData, outputData)

  return { inputData: parsedInputData, outputData, msg }
}

const compareParsedSting = (inputData: string, outputData: string) => {
  let parsedInputData = inputData.split('\n')
  let parsedOutputData = outputData.split('\n')

  let message = ''
  if(parsedInputData.length == 1 || parsedOutputData.length == 1)
    return chalk.red('Input or output data is empty')

  for(let [i, value] of parsedInputData.entries()) {
    if(parsedOutputData[i] !== value) {
      message = chalk.green(`Expected: `) + parsedOutputData[i] + chalk.red(`\nActual: `) + value
      break
    }
  }
  return message
}