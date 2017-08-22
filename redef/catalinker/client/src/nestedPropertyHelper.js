(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.nestedPropertyHelper = factory();
  }
}(this, function () {
  "use strict"
  const _ = require('underscore')
  const ldGraph = require('ld-graph')
  const axios = require('axios')
  const utils = require('./utils')

  return {
    // extracts name of agent associated with a contribution that has type MainEntry
    mainEntryName: function (node) {
      const contribution = _.find(node.outAll('contributor'), contributor => {
        return contributor.isA("MainEntry")
      })
      if (contribution) {
        const agent = contribution.out('agent')
        return agent.get("name").value || ''
      }
      return ''
    },
    // extracts anme of corporation/person associated with of publishedBy relation
    // returns a Promise since an asynchronous call is made to fetch the related resource
    publisherName: function (node) {
      const publishedByUri = _.first(node.outAll('publishedBy'))
      if (publishedByUri) {
        return axios.get(utils.proxyToServices(publishedByUri.id), {
          headers: {
            Accept: 'application/ld+json'
          }
        }).then(response => {
          const graphData = utils.ensureJSON(response.data)
          const root = ldGraph.parse(graphData).byId(publishedByUri.id)
          const name = root.get('name').value
          const specification = _.first(root.getAll('specification'))
          const specificationPart = specification ? ` (${specification.value})` : ''
          return Promise.resolve(`${name}${specificationPart}`)
        })
      } else {
        return ''
      }
    }
  }
}));
