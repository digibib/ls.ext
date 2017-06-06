const fetch = require('isomorphic-fetch')
const searchBuilder = require('../utils/searchBuilder')

module.exports = (app) => {
  app.get('/q', (request, response) => {
    const queryString = request.originalUrl.substr(request.originalUrl.indexOf('?') + 1)
    fetch('http://elasticsearch:9200/search/work/_search', {
      method: 'POST',
      body: JSON.stringify(searchBuilder.buildUnfilteredAggregatedQuery(queryString))
    }).then(res => {
      if (res.ok) {
        return res.json().then(aggregationResult => {
          return fetch('http://elasticsearch:9200/search/work/_search', {
            method: 'POST',
            body: JSON.stringify(searchBuilder.buildQuery(queryString))
          }).then(res => {
            return res.json().then(searchResult =>{
              Object.keys(aggregationResult.aggregations.facets).forEach(facet => {
                searchResultFacet = searchResult.aggregations.facets[facet]
                if (typeof searchResultFacet === 'object') {
                  if (!searchResultFacet) {
                    searchResult.aggregations.facets[ facet ] = aggregationResult.aggregations.facets[ facet ]
                  } else {
                    aggregationResult.aggregations.facets[ facet ].buckets.forEach(aggBucket => {
                      if (!searchResultFacet.buckets.find(bucket => {return bucket.key === aggBucket.key})) {
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
              searchResult.aggregations = aggregationResult.aggregations
              return searchResult
            })
          })
        })
      } else {
        return res.text().then(error => { return Promise.reject({ message: error, queryString: queryString }) })
      }
    }).then(json => response.status(200).send(json))
      .catch(error => {
        console.log(`Error in query: ${error.queryString}\n${error.message}`)
        response.sendStatus(500)
      })
  })
}
