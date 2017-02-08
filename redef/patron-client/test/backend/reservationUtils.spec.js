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
      const item = {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(56).fill(item)
      const queuePlace = 7
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('0–1')
    })

    it('should know that a reserve in a long queue (54) for a book with many items is due in 4-5 weeks', () => {
      const item = {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(33).fill(item)
      const queuePlace = 54
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('4–5')
    })

    it('should know that a reserve in a long queue (49/19ex.) for a book with many items is due in 8-9 weeks', () => {
      const item = {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(19).fill(item)
      const queuePlace = 49
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('8–9')
    })

    it('should know that a reserve in a long queue (41/33ex.) for a book with many items is due in 4-5 weeks', () => {
      const item = {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(33).fill(item)
      const queuePlace = 41
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('4–5')
    })

    it('should know that a reserve in a long queue (70/30ex.) for a book with many items is due in 8-9 weeks', () => {
      const item = {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(30).fill(item)
      const queuePlace = 70
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('8–9')
    })

    it('should know that a reserve in a long queue (80/30ex.) for a book with many items is due in 8-9 weeks', () => {
      const item = {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(30).fill(item)
      const queuePlace = 80
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('8–9')
    })

    it('should know that a reserve in a long queue (88/30ex.) for a book with many items is due in 8-9 weeks', () => {
      const item = {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(30).fill(item)
      const queuePlace = 88
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('8–9')
    })

    it('should know that a reserve in a long queue (58/19ex.) for a book with many items is due in more than 12 weeks', () => {
      const item = {
        'onloan': new Date(dayToday + (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(19).fill(item)
      const queuePlace = 58
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('12')
    })

    it('should know that a reserve in a long queue (50/19ex.) for a film with many items is due in 6-7 weeks', () => {
      const item = {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'FILM',
        'reservable': 1
      }
      const items = Array(19).fill(item)
      const queuePlace = 58
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('6–7')
    })

    it('should know that a reserve in a long queue (50/19ex.) with an extra week wait for a film with many items is due in 7-8 weeks', () => {
      const item = {
        'onloan': new Date(dayToday + (oneWeekInSeconds)).toISOString(),
        'itype': 'FILM',
        'reservable': 1
      }
      const items = Array(19).fill(item)
      const queuePlace = 58
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('7–8')
    })

    it('should know a book with two items and a que of six with an offset of one week will be available in 9-10 weeks', () => {
      const item = {
        'onloan': new Date(dayToday + (oneWeekInSeconds)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(2).fill(item)
      const queuePlace = 6
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('9–10')
    })

    it('should know a book which is soon to be returned should be available after the next borrower', () => {
      const item = {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(1).fill(item)
      const queuePlace = 2
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('4–5')
    })

    it('should know that a soon-to-be-available book should be available in two loans (8-9 weeks)', () => {
      const item = {
        'onloan': new Date(dayToday - (oneWeekInSeconds * 4)).toISOString(),
        'itype': 'BOK',
        'reservable': 1
      }
      const items = Array(3).fill(item)
      const queuePlace = 7
      expect(
        estimateWaitingPeriod(queuePlace, items)
      ).toEqual('8–9')
    })
  })
})
