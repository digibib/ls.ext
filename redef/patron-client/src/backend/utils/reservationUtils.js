module.exports.estimateWaitingPeriod = function (queuePlace, items) {
  return (queuePlace, items) => {
    if (items.length < 1) {
      return 'unknown'
    }
    if (queuePlace === 0) {
      return 'inTransit'
    }

    const reservableItems = items.filter(isReservable)

    if (reservableItems.length < 1) {
      return 'unknown'
    }

    const availableItems = reservableItems.filter(isAvailable)
    if (availableItems.length > 0 && queuePlace === 1) {
      return 'pending'
    } else {
      return getWaitPeriod(queuePlace, reservableItems)
    }
  }
}

function isReservable (item) {
  return item.reservable === 1
}

function isAvailable (item) {
  return item.onloan === null
}

function getWaitPeriod (queuePlace, items) {
  const queued = queuePlace || 1
  const estimate = getEstimatedPeriod(queued, items)

  if (estimate === 'unknown') {
    return estimate
  }

  const floor = Math.floor(estimate)
  const ceiling = (floor === estimate) ? Math.ceil(estimate) + 1 : Math.ceil(estimate)
  const returnVal = (floor < 12) ? `${floor}–${ceiling}` : '12'

  return returnVal
}

function getEstimatedPeriod (queuePlace, items) {
  // Explanation:
  // We're checking that there are items available to loan, then we find the item with the earliest onloan date
  // then we get the loan period based on the itemtype, multiplying this by seconds in a day (assumes loan periods
  // are expressed in days). This number is then added to the earliest loan date expressed as seconds and then we
  // subtract the current date in seconds; this gives us the number of seconds until the earliest loan will become
  // available. If the product of this calculation is less than zero (indicating that a loan is outstanding), we
  // simply use zero as a base, if not, we use the product. We then add the product to the product of adding
  // item-loan length multiplied by queue-place-minus-one (because in reality, if you're first in the queue, you're
  // number zero, i.e. you get it as soon as the previous borrower returns it) divided by the number of seconds in a
  // week, which gives you an indication of how many weeks one has to wait.

  if (items) {
    const secondsInDay = 1000 * 60 * 60 * 24
    const secondsInAWeek = secondsInDay * 7
    const oldestLoan = getOldestLoan(items)
    const itemLoanLength = getLoanPeriod(oldestLoan.itype) * secondsInDay
    const initialTo = (Date.parse(oldestLoan.onloan) + itemLoanLength) - Date.now()
    const startDate = (initialTo > 0) ? initialTo : 0
    const estimate = Math.ceil(((startDate + (itemLoanLength * (queuePlace - 1))) / secondsInAWeek))
    return isNaN(estimate) ? 'unknown' : estimate
  } else {
    return 'unknown'
  }
}

function getLoanPeriod (itemtype, borrowerCategory = 'V') {
  if (borrowerCategory) {
    // TODO decide if we want to fix this.
  }

  switch (itemtype) {
    case 'FILM' :
    case 'KART' :
    case 'MUSIKK' :
    case 'PERIODIKA' :
      return 14
    case 'BOK' :
    case 'LYDBOK' :
    case 'NOTER' :
    case 'REALIA' :
    case 'SPILL' :
    case 'SPRAAKKURS' :
    default :
      return 28
  }
}

function getOldestLoan (items) {
  const sorted = items.sort(
    (a, b) => {
      return a.onloan > b.onloan
    })
  return sorted[0]
}
