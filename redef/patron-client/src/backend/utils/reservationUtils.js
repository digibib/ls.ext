module.exports.estimateWaitingPeriod = (queuePlace, items) => {
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
  if (queuePlace <= availableItems.length) {
    return 'pending'
  } else {
    return getWaitPeriod(queuePlace, reservableItems)
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
  if (items) {
    const cutoff = items.length * 3

    if (queuePlace > cutoff) {
      return 12
    }

    if (items.length === 1 || queuePlace === 1) {
      return estimateLinear(getOffsetInWeeks(items[ 0 ].onloan), queuePlace, getLoanPeriod(items[ 0 ].itype, null))
    }

    const distributedQueuePlace = (items.length >= queuePlace) ? queuePlace : Math.ceil(queuePlace / items.length)
    const derivedQueuePlace = (distributedQueuePlace === queuePlace) ? 1 : distributedQueuePlace
    const relevantDueDate = (queuePlace <= items.length) ? items[ queuePlace - 1 ].onloan : items[ distributedQueuePlace - 1 ].onloan
    const itemLoanLength = (getLoanPeriod(items[ 0 ].itype))
    const offset = getOffsetInWeeks(relevantDueDate)
    const estimate = offset + ((derivedQueuePlace - 1) * itemLoanLength)

    return isNaN(estimate) ? 'unknown' : estimate
  } else {
    return 'unknown'
  }
}

function estimateLinear (offset, queuePlace, loanWeeks) {
  return offset + (loanWeeks * (queuePlace - 1))
}

function getOffsetInWeeks (date) {
  const currentDate = Date.now()
  const parsedDate = Date.parse(date)
  if (isNaN(parsedDate)) {
    return 0
  }
  if (parsedDate < currentDate) {
    return 0
  } else {
    return Math.ceil((parsedDate - currentDate) / (1000 * 60 * 60 * 24 * 7))
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
      return 14 / 7
    case 'BOK' :
    case 'LYDBOK' :
    case 'NOTER' :
    case 'REALIA' :
    case 'SPILL' :
    case 'SPRAAKKURS' :
    default :
      return 28 / 7
  }
}
