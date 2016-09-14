const fs = require('fs')
const path = require('path')
const process = require("process")
require('babel-register')

const startPathComponents = `${__dirname}/../src/frontend/components`
const startPathContainers = `${__dirname}/../src/frontend/containers`

loopThroughDirectories([ startPathComponents, startPathContainers ])

function loopThroughDirectories (sourcePaths) {
  sourcePaths.forEach(sourcePath => {
    // Loop through all the files in the directory
    fs.readdir(sourcePath, function (err, files) {
      if (err) {
        console.error("Could not list the directory.", err)
        process.exit(1)
      }
      let messagesFromFiles = {}
      files.forEach(function (file, index) {
        const filePath = path.join(sourcePath, file)

        fs.stat(filePath, function (error, stat) {
          if (error) {
            console.error("Error stating file.", error)
            return
          }

          if (stat.isFile()) {
            console.log("'%s' is a file.", filePath)
            const fileParts = filePath.split('.')
            const fileEnding = fileParts[ fileParts.length - 1 ]
            const fileParts2 = filePath.split('/')
            const fileName = fileParts2[ fileParts2.length - 1 ]
            if (fileEnding === 'js' && fileName !== 'main.js')getMessagesFromFile(filePath, fileName)
          }
          else if (stat.isDirectory()) {
            console.log("'%s' is a directory.", filePath)
            loopThroughDirectories([ filePath ])
          }
        })
      })
    })
  })
}

function getMessagesFromFile (filePath, fileName) {
  try {
    console.log('getting messages from', fileName)
    const file = require(filePath)
    console.log(fileName, file.messages ? 'has messages' : 'does not have messages', '\n')
  } catch (e) {
    console.log('error occured:', e)
  }
}
