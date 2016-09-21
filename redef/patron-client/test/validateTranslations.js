const fs = require('fs')
const path = require('path')
require('babel-register')
require('ignore-styles')
require('node-browser-environment')()
require('localstorage-polyfill')

const startPath = `${__dirname}/../src/frontend`

// exclude main.js, Root.js, index.js and filterParser.js because of issues
// with localStorages setItem() and getItem() causing errors.
// These files do not have messages anyway
const ignoredFiles = [
  path.join(__dirname, '/../src/frontend/routes/index.js'),
  path.join(__dirname, '/../src/frontend/store/index.js'),
  path.join(__dirname, '/../src/frontend/main.js'),
  path.join(__dirname, '/../src/frontend/utils/filterParser.js'),
  path.join(__dirname, '/../src/frontend/containers/Root.js')
]

module.exports.hasUntranslatedMessages = null

const getFiles = (directory, done) => {
  let results = []
  fs.readdir(directory, (err, list) => {
    if (err) {
      return console.log(err)
    }
    let pending = list.length
    if (!pending) return done(results)
    list.forEach((file) => {
      file = path.resolve(directory, file)
      fs.stat(file, (err, stat) => {
        if (err) {
          console.log(err)
        }
        if (stat && stat.isDirectory()) {
          return getFiles(file, (res) => {
            results = results.concat(res)
            if (!--pending) done(results)
          })
        } else {
          results.push(file)
          if (!--pending) done(results)
        }
      })
    })
  })
}

const parseFile = (filePath) => {
  const file = require(filePath)
  if (file.messages) {
    const messagesFromFiles = {}
    Object.keys(file.messages).forEach(key => {
      const id = file.messages[ key ].id
      messagesFromFiles[ id ] = filePath
    })
    return messagesFromFiles
  }
}

const compareTranslations = (messages) => {
  const norwegianMessages = require(path.join(__dirname, '../src/frontend/i18n/no.js')).default
  const englishKeys = Object.keys(messages)
  const norCopy = JSON.parse(JSON.stringify(norwegianMessages))
  const engCopy = JSON.parse(JSON.stringify(messages))
  englishKeys.forEach(key => {
    if (norwegianMessages[ key ]) {
      delete norCopy[ key ]
      delete engCopy[ key ]
    }
  })
  if (Object.keys(norCopy).length !== 0) console.log('Unused norwegian translations in i18n: \n', norCopy, '\n')
  if (Object.keys(engCopy).length !== 0) console.log('Messages missing norwegian translation in i18n: \n', engCopy)
  module.exports.hasUntranslatedMessages = Object.keys(norCopy).length === 0 && Object.keys(engCopy).length === 0
}

module.exports.validate = () => {
  getFiles(startPath, (res) => {
    const messages = {}
    res.forEach(filePath => {
      const fileParts = filePath.split('/')
      const fileName = fileParts[ fileParts.length - 1 ]
      const fileEnding = fileName.split('.')[ 1 ]

      // Process only .js files
      if (fileEnding === 'js' && !ignoredFiles.includes(filePath)) {
        const parsedMessages = parseFile(filePath)
        if (parsedMessages) {
          Object.keys(parsedMessages).forEach(key => {
            messages[ key ] = parsedMessages[ key ]
          })
        }
      }
    })
    compareTranslations(messages)
  })
}

