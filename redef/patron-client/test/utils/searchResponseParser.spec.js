import expect from 'expect'
import { approximateBestTitle } from '../../src/frontend/utils/searchResponseParser'

describe('utils', () => {
  describe('searchResponseParser', () => {
    describe('approximateBestTitle', () => {
      it('should choose first matching Norwegian mainTitle and partTitle if available', () => {
        let publications = [
          { mainTitle: 'mt_test1', partTitle: 'pt_test1' },
          { mainTitle: 'mt_test2', partTitle: 'pt_test2', language: 'Engelsk' },
          { mainTitle: 'mt_test3', partTitle: 'pt_test3', language: 'Norsk (bokmål)' },
          { mainTitle: 'mt_test4', partTitle: 'pt_test4', language: 'Norsk (bokmål)' }
        ]
        let chosenPublication = approximateBestTitle(publications, 'test')
        expect(chosenPublication).toEqual(publications[ 2 ])
      })
      it('should choose first matching English mainTitle and partTitle if Norwegian is not available', () => {
        let publications = [
          { mainTitle: 'mt_test1', partTitle: 'pt_test1' },
          { mainTitle: 'mt_test2', partTitle: 'pt_test2', language: 'Engelsk' },
          { mainTitle: 'mt_test3', partTitle: 'pt_test3', language: 'Svensk' },
          { mainTitle: 'mt_test4', partTitle: 'pt_test4', language: 'Engelsk' }
        ]
        let chosenPublication = approximateBestTitle(publications, 'test')
        expect(chosenPublication).toEqual(publications[ 1 ])
      })
      it('should choose first mainTitle and partTitle with a match if no Norwegian or English publication is available', () => {
        let publications = [
          { mainTitle: 'mt_not1', partTitle: 'pt_not1', language: 'Svensk' },
          { mainTitle: 'mt_test2', partTitle: 'pt_test2', language: 'Finsk' },
          { mainTitle: 'mt_test3', partTitle: 'pt_test3', language: 'Dansk' }
        ]
        let chosenPublication = approximateBestTitle(publications, 'test')
        expect(chosenPublication).toEqual(publications[ 1 ])
      })
      it('should return undefined if no matches', () => {
        let publications = [
          { mainTitle: 'mt_not1', partTitle: 'pt_not1', language: 'Norsk (bokmål)' }
        ]
        let chosenPublication = approximateBestTitle(publications, 'test')
        expect(chosenPublication).toEqual(undefined)
      })
    })
  })
})