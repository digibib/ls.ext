const fetch = require('isomorphic-fetch')
const searchBuilder = require('../utils/searchBuilder')

/*
function mergeAggregation (aggregationResult, searchResult) {
  // merge work level aggregations (audiences & fictionNonficiton) into facets
  aggregationResult.aggregations.facets.audiences = aggregationResult.aggregations.audiences
  aggregationResult.aggregations.facets.fictionNonfiction = aggregationResult.aggregations.fictionNonfiction
  searchResult.aggregations.facets.audiences = searchResult.aggregations.audiences
  searchResult.aggregations.facets.fictionNonfiction = searchResult.aggregations.fictionNonfiction

  Object.keys(aggregationResult.aggregations.facets).forEach(facet => {
    const searchResultFacet = searchResult.aggregations.facets[ facet ]
    if (typeof searchResultFacet === 'object') {
      if (!searchResultFacet) {
        searchResult.aggregations.facets[ facet ] = aggregationResult.aggregations.facets[ facet ]
      } else {
        aggregationResult.aggregations.facets[ facet ].buckets.forEach(aggBucket => {
          if (!searchResultFacet.buckets.find(bucket => { return bucket.key === aggBucket.key })) {
            searchResultFacet.buckets.push({
              key: aggBucket.key,
              doc_count: 0,
              parents: { value: 0 }
            })
          }
        })
      }
    }
  })
  return searchResult
}
*/

module.exports = (app) => {
  app.get('/q', (request, response) => {
    const queryString = request.originalUrl.substr(request.originalUrl.indexOf('?') + 1)

    fetch('http://elasticsearch:9200/search/work/_search', {
      method: 'POST',
      body: JSON.stringify(searchBuilder.buildQuery(queryString))
    }).then(res => {
      if (res.ok) {
        return res.json()
      } else {
        return res.text().then(error => { return Promise.reject({ message: error, queryString: queryString }) })
      }
    }).then(json => response.status(200).send(json))
      .catch(error => {
        response.status(500).send({ message: error, queryString: queryString })
      })
  })
}
