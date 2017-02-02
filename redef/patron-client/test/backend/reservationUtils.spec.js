/* eslint-env mocha */
import expect from 'expect'
import { estimateWaitingPeriod } from '../../src/backend/utils/reservationUtils'

const dayToday = Date.now()
const oneWeekInSeconds = 1000 * 60 * 60 * 24 * 7

describe('reservation utils', () => {
  describe('estimateWaitingPeriod', () => {
    it('should not know what is happening', () => {
      const items = []
      const queuePlace = 0
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('unknown')
    })

    it('should know that the item is in transit', () => {
      const items = [ {} ]
      const queuePlace = 0
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('inTransit')
    })

    it('should know something is wrong', () => {
      const items = [ {} ]
      const queuePlace = 1
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('unknown')
    })

    it('should know a reserve is about to be effectuated', () => {
      const items = [ {
        'onloan': null,
        'itype': 'BOK',
        'reservable': 1
      } ]
      const queuePlace = 1
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('pending')
    })

    it('should know a reserve has a waiting time of 0-1 weeks', () => {
      const date = new Date(dayToday).toISOString()
      const items = [ {
        'onloan': date.substring(0, date.indexOf('T')),
        'itype': 'BOK',
        'reservable': 1
      } ]
      const queuePlace = 1
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('0–1')
    })

    it('should know a reserve has a waiting time of 1-2 weeks', () => {
      const dateOne = new Date(dayToday + (oneWeekInSeconds * 1)).toISOString()
      const items = [ {
        'onloan': dateOne.substring(0, dateOne.indexOf('T')),
        'itype': 'BOK',
        'reservable': 1
      } ]
      const queuePlace = 1
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('1–2')
    })

    it('should know a reserve has a waiting time of 2-3 weeks', () => {
      const dateOne = new Date(dayToday + (oneWeekInSeconds * 2)).toISOString()
      const items = [ {
        'onloan': dateOne.substring(0, dateOne.indexOf('T')),
        'itype': 'BOK',
        'reservable': 1
      } ]
      const queuePlace = 1
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('2–3')
    })

    it('should know a reserve has a waiting time of more than 12 weeks version 1', () => {
      const date = new Date(dayToday + (oneWeekInSeconds * 4)).toISOString()
      const items = [ {
        'onloan': date.substring(0, date.indexOf('T')),
        'itype': 'BOK',
        'reservable': 1
      } ]
      const queuePlace = 3
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('12')
    })

    it('should know a reserve has a waiting time of 1-2 weeks from multiple reserves', () => {
      const dateOne = new Date(dayToday + oneWeekInSeconds).toISOString()
      const dateTwo = new Date(dayToday + (oneWeekInSeconds * 3)).toISOString()
      const items = [ {
        'onloan': dateOne.substring(0, dateOne.indexOf('T')),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': dateTwo.substring(0, dateTwo.indexOf('T')),
        'itype': 'BOK',
        'reservable': 1
      } ]
      const queuePlace = 1
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('1–2')
    })

    it('should know a reserve has a waiting time of 0-1, 1-2...11-12 weeks', () => {
      [ 2, 3 ].forEach((n) => {
        const from = (n === 2) ? 4 : 8
        const items = [ {
          'onloan': null,
          'itype': 'BOK',
          'reservable': 1
        } ]
        const queuePlace = n
        expect(
          estimateWaitingPeriod(queuePlace, items)
        ).toEqual(`${from}–${from + 1}`)
      })
    })

    it('should know a reserve has a waiting time of more than 12 weeks', () => {
      const dateOne = new Date(dayToday + (oneWeekInSeconds * 4)).toISOString()
      const items = [ {
        'onloan': dateOne.substring(0, dateOne.indexOf('T')),
        'itype': 'BOK',
        'reservable': 1
      } ]
      const queuePlace = 4
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('12')
    })

    it('should know a reserve for different materials has a waiting time of 4-5 weeks', () => {
      [ 'BOK', 'LYDBOK', 'NOTER', 'REALIA', 'SPILL', 'SPRAAKKURS' ].forEach((n) => {
        const items = [ {
          'onloan': null,
          'itype': n,
          'reservable': 1
        } ]
        const queuePlace = 2
        expect(
          estimateWaitingPeriod(queuePlace, items)
        ).toEqual('4–5')
      })
    })

    it('should know that a reserve in a long queue for a book with many items is due in 4-5 weeks', () => {
      const items = [ {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      } ]
      const queuePlace = 4
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('4–5')
    })

    it('should know that a reserve in a long queue for a book with many items is due soon', () => {
      const items = [ {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }, {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      } ]
      const queuePlace = 7
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('0–1')
    })
  })
})
