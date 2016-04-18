/* eslint-env mocha */
import expect from 'expect'
import { approximateBestTitle } from '../../src/frontend/utils/searchResponseParser'

describe('utils', () => {
  describe('searchResponseParser', () => {
    describe('approximateBestTitle', () => {
      it('should choose first matching Norwegian publication if available', () => {
        let publications = [
          { mainTitle: 'mt_test1', partTitle: 'pt_test1', language: [] },
          { mainTitle: 'mt_test2', partTitle: 'pt_test2', language: [ 'http://lexvo.org/id/iso639-3/eng' ] },
          { mainTitle: 'mt_test3', partTitle: 'pt_test3', language: [ 'http://lexvo.org/id/iso639-3/nob' ] },
          { mainTitle: 'mt_test4', partTitle: 'pt_test4', language: [ 'http://lexvo.org/id/iso639-3/nob' ] }
        ]
        let chosenPublication = approximateBestTitle(publications, { 'work.publication.mainTitle': [ 'mt_test1', 'mt_test2', 'mt_test3', 'mt_test4' ] })
        expect(chosenPublication).toEqual(publications[ 2 ])
      })

      it('should choose first matching English publication if Norwegian is not available', () => {
        let publications = [
          { mainTitle: 'mt_test1', partTitle: 'pt_test1', language: [] },
          { mainTitle: 'mt_test2', partTitle: 'pt_test2', language: [ 'http://lexvo.org/id/iso639-3/eng' ] },
          { mainTitle: 'mt_test3', partTitle: 'pt_test3', language: [ 'http://lexvo.org/id/iso639-3/swe' ] },
          { mainTitle: 'mt_test4', partTitle: 'pt_test4', language: [ 'http://lexvo.org/id/iso639-3/eng' ] }
        ]
        let chosenPublication = approximateBestTitle(publications, { 'work.publication.mainTitle': [ 'mt_test1', 'mt_test2', 'mt_test3', 'mt_test4' ] })
        expect(chosenPublication).toEqual(publications[ 1 ])
      })

      it('should choose first publication with a match if no Norwegian or English publication is available', () => {
        let publications = [
          { mainTitle: 'mt_not1', partTitle: 'pt_not1', language: [ 'http://lexvo.org/id/iso639-3/swe' ] },
          { mainTitle: 'mt_test2', partTitle: 'pt_test2', language: [ 'http://lexvo.org/id/iso639-3/fin' ] },
          { mainTitle: 'mt_test3', partTitle: 'pt_test3', language: [ 'http://lexvo.org/id/iso639-3/dan' ] }
        ]
        let chosenPublication = approximateBestTitle(publications, { 'work.publication.mainTitle': [ 'mt_test2', 'mt_test3' ] })
        expect(chosenPublication).toEqual(publications[ 1 ])
      })

      it('should choose first Norwegian publication if no matches', () => {
        let publications = [
          { mainTitle: 'mt_test1', partTitle: 'pt_test1', language: [] },
          { mainTitle: 'mt_test2', partTitle: 'pt_test2', language: [ 'http://lexvo.org/id/iso639-3/eng' ] },
          { mainTitle: 'mt_test3', partTitle: 'pt_test3', language: [ 'http://lexvo.org/id/iso639-3/nob' ] },
          { mainTitle: 'mt_test4', partTitle: 'pt_test4', language: [ 'http://lexvo.org/id/iso639-3/nob' ] }
        ]
        let chosenPublication = approximateBestTitle(publications, { 'work.publication.mainTitle': [] })
        expect(chosenPublication).toEqual(publications[ 2 ])
      })

      it('should choose first English publication if no matches and Norwegian is not available', () => {
        let publications = [
          { mainTitle: 'mt_test1', partTitle: 'pt_test1', language: [] },
          { mainTitle: 'mt_test2', partTitle: 'pt_test2', language: [ 'http://lexvo.org/id/iso639-3/eng' ] },
          { mainTitle: 'mt_test3', partTitle: 'pt_test3', language: [ 'http://lexvo.org/id/iso639-3/swe' ] },
          { mainTitle: 'mt_test4', partTitle: 'pt_test4', language: [ 'http://lexvo.org/id/iso639-3/eng' ] }
        ]
        let chosenPublication = approximateBestTitle(publications, { 'work.publication.mainTitle': [] })
        expect(chosenPublication).toEqual(publications[ 1 ])
      })

      it('should return first publication if no matches and no Norwegian or English publications', () => {
        let publications = [
          { mainTitle: 'mt_not1', partTitle: 'pt_not1', language: [ 'http://lexvo.org/id/iso639-3/swe' ] },
          { mainTitle: 'mt_not2', partTitle: 'pt_not2', language: [ 'http://lexvo.org/id/iso639-3/fin' ] }
        ]
        let chosenPublication = approximateBestTitle(publications, { 'work.publication.mainTitle': [ 'test' ] })
        expect(chosenPublication).toEqual(publications[ 0 ])
      })

      it('should return undefined if no publications', () => {
        let publications = []
        let chosenPublication = approximateBestTitle(publications, { 'work.publication.mainTitle': [ 'test' ] })
        expect(chosenPublication).toEqual(undefined)
      })

      it('should match partTitle', () => {
        let publications = [
          { mainTitle: 'mt_test1', partTitle: 'pt_test1', language: [] },
          { mainTitle: 'mt_test2', partTitle: 'pt_test2', language: [ 'http://lexvo.org/id/iso639-3/eng' ] },
          { mainTitle: 'mt_test3', partTitle: 'pt_test3', language: [ 'http://lexvo.org/id/iso639-3/nob' ] },
          { mainTitle: 'mt_test4', partTitle: 'pt_test4', language: [ 'http://lexvo.org/id/iso639-3/nob' ] }
        ]
        let chosenPublication = approximateBestTitle(publications, { 'work.publication.partTitle': [ 'pt_test1', 'pt_test2', 'pt_test3', 'pt_test4' ] })
        expect(chosenPublication).toEqual(publications[ 2 ])
      })
    })
  })
})
