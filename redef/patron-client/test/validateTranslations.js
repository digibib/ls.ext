const fs = require('fs')
const path = require('path')
const process = require("process")
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

const getFiles = (directory, done) => {
  var results = [];
  fs.readdir(directory, (err, list) => {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(directory, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          return getFiles(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) return done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) return done(null, results);
        }
      })
    })
  })
}

const parseFile = (filePath) => {
  const file = require(filePath)
  if (file.messages) {
    let messagesFromFiles = {}
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
  let norCopy = JSON.parse(JSON.stringify(norwegianMessages))
  let engCopy = JSON.parse(JSON.stringify(messages))
  englishKeys.forEach(key => {
    if (norwegianMessages[ key ]) {
      delete norCopy[ key ]
      delete engCopy[ key ]
    }
  })
  if (norCopy != {})console.log('Unused norwegian translations in i18n: \n', norCopy, '\n')
  if (engCopy != {})console.log('Messages missing norwegian translation in i18n: \n', engCopy)
  return norCopy == {} && engCopy == {}
}

module.exports.validate = () => {
  console.log('validate')
  return getFiles(startPath, (err, res) => {
    console.log('getFiles')
    let messages = {}
    res.forEach(filePath => {
      const fileParts = filePath.split('/')
      const fileName = fileParts[ fileParts.length - 1 ]
      const fileEnding = fileName.split('.')[ 1 ]

      // Process only .js files
      if (fileEnding === 'js' && !ignoredFiles.includes(filePath)) {
        const parsedMessages = parseFile(filePath)
        if (parsedMessages)Object.keys(parsedMessages).forEach(key => {
          messages[ key ] = parsedMessages[ key ]
        })
      }
    })
    return compareTranslations(messages)
  })
}
