const chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  NestedPropertyHelper = require('../src/nestedPropertyHelper.js'),
  ldGraph = require('ld-graph'),
  sinon = require('sinon'),
  axios = require('axios'),
  fs = require('fs'),
  assert = chai.assert,
  should = chai.should

chai.use(chaiAsPromised)

const workWithRelations = fs.readFileSync(__dirname + '/mocks/w832213854948.json', 'UTF-8')
const workWithoutMainEntry = fs.readFileSync(__dirname + '/mocks/w8308833324.json', 'UTF-8')
const workWithoutContribs = fs.readFileSync(__dirname + '/mocks/w830883854948.json', 'UTF-8')
const series = fs.readFileSync(__dirname + '/mocks/s755809170436.json', 'UTF-8')

describe('Extracting nested properties from graphs', function () {

  describe('Extracting nested properties from work', function () {
    it('can extract mainEntryName', function () {
      const graph = ldGraph.parse(JSON.parse(workWithRelations))
      return assert.equal(NestedPropertyHelper.mainEntryName(graph.byType('Work')[ 0 ]), 'Olsen, Karl')
    })

    it('returns empty when contribution is not main entry', function () {
      const graph = ldGraph.parse(JSON.parse(workWithoutMainEntry))
      return assert.equal(NestedPropertyHelper.mainEntryName(graph.byType('Work')[ 0 ]), '')
    })

    it('returns empty when no contributions', function () {
      const graph = ldGraph.parse(JSON.parse(workWithoutContribs))
      return assert.equal(NestedPropertyHelper.mainEntryName(graph.byType('Work')[ 0 ]), '')
    })
  })

  describe('Extracting nested properties from series', function () {
    before(function (done) {
      // http requests from axios used in module, faking returned promises
      sinon.stub(axios, "get", function (path) {
        switch (path) {
          case "/services/corporation/c992230760239":
            return Promise.resolve({ data: fs.readFileSync(__dirname + "/mocks/c992230760239.json", "UTF-8") });
        }
      })
      done()
    })

    it('can extract series publisher name', function () {
      const graph = ldGraph.parse(JSON.parse(series))
      return assert.eventually.equal(NestedPropertyHelper.publisherName(graph.byType('Serial')[ 0 ]), 'Noregs Bondelag (Stjørdal)')
    })
  })
})
