const fetch = require('isomorphic-fetch')
const searchBuilder = require('../utils/searchBuilder')

module.exports = (app) => {
  app.get('/q', (request, response) => {
    const queryString = request.originalUrl.substr(request.originalUrl.indexOf('?') + 1)

    function mergeAggregation (aggregationResult, searchResult) {
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

    Promise.all([
      fetch('http://elasticsearch:9200/search/work/_search', {
        method: 'POST',
        body: JSON.stringify(searchBuilder.buildUnfilteredAggregatedQuery(queryString))
      }).then(res => res.json()),
      fetch('http://elasticsearch:9200/search/work/_search', {
        method: 'POST',
        body: JSON.stringify(searchBuilder.buildQuery(queryString))
      }).then(res => res.json())
    ]).then(res => {
      return mergeAggregation(res[ 0 ], res[ 1 ])
    }).then(json => response.status(200).send(json))
      .catch(error => { response.status(500).send({ message: error, queryString: queryString }) })
  })
}
