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

const compareParsedSting = (firstString: string, secondString: string) => {
  let parsedFirstString = firstString.split('\n') 
  let parsedSecondString = secondString.split('\n')
  let message = chalk.red('Input or output data is empty')

  for(let [i, value] of parsedFirstString.entries()) {
    if(!parsedSecondString.includes(value)) {
      message = chalk.green(`Expected: `) + value + chalk.red(`\nReceived: `) + parsedSecondString[i]
      break
    }
  }  
  return message
}