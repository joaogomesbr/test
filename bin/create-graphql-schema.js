const chalk = require('chalk')
const boxen = require('boxen')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const { printSchema } = require('graphql')

const { prepareKeystoneExpressApp } = require('@core/keystone/test.utils')
const { taskQueue } = require('@core/keystone/tasks')

const writeFile = promisify(fs.writeFile)

const CODEGEN_CONFIG = `
# this file is generated by bin/create-graphql-schema.js
# the file is required for @graphql-codegen package
schema: ./schema.graphql
generates:
  ./schema.d.ts:
    plugins:
      - typescript
`


async function getGraphQLSchema (keystoneModule) {
    const { keystone } = await prepareKeystoneExpressApp(keystoneModule)
    const internalSchema = keystone._schemas['internal']
    const result = printSchema(internalSchema)
    await keystone.disconnect()
    await taskQueue.close()
    return result
}

async function generate ({ name, namePath }) {
    await writeFile(path.join(namePath, 'codegen.yaml'), CODEGEN_CONFIG)
    const schema = await getGraphQLSchema(require(path.join(namePath, 'index')))
    await writeFile(path.join(namePath, 'schema.graphql'), schema)
}

function createGraphQLSchema () {
    const name = path.basename(process.cwd())
    const namePath = path.join(__dirname, '..', 'apps', name)
    const greeting = chalk.white.bold(name)
    const boxenOptions = {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
        backgroundColor: '#555555',
    }
    const msgBox = boxen(greeting, boxenOptions)
    console.log(msgBox)
    generate({ name, namePath })
}

createGraphQLSchema()
