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
  const ceiling = (floor === estimate) ? Math.ceil(estimate) + 2 : Math.ceil(estimate)
  const watingPeriod = (floor < 11) ? `${floor}–${ceiling}` : '10'

  return watingPeriod
}

function getQP (queuePlace, items) {
  const pointValues = Array.apply(null, { length: queuePlace }).map(Number.call, Number)
  let matrix = []
  let i = 0
  while (pointValues.length) {
    matrix = pointValues.splice(0, items)
    i++
  }
  return getMatrixObject(matrix.length, i)
}

function getMatrixPosition (items, queuePlace) {
  if (items >= queuePlace) {
    return getMatrixObject(queuePlace)
  } else {
    return getQP(queuePlace, items)
  }
}

function getMatrixObject (xAxis, yAxis = 1) {
  return {x: xAxis, y: yAxis}
}

function getEstimatedPeriod (queuePlace, items) {
  if (items) {
    const itemLoanLength = (getLoanPeriod(items[ 0 ].itype))
    const cuttoffMultiplier = 12 / itemLoanLength
    const cutoff = items.length * cuttoffMultiplier

    if (queuePlace > cutoff) {
      return 12
    }

    if (items.length === 1 || queuePlace === 1) {
      return estimateLinear(getOffsetInWeeks(items[ 0 ].onloan), queuePlace, getLoanPeriod(items[ 0 ].itype, null))
    }

    const maxtrixPosition = getMatrixPosition(items.length, queuePlace)
    const relevantDueDate = items[ maxtrixPosition.x - 1 ].onloan
    const offset = getOffsetInWeeks(relevantDueDate)
    const estimate = estimateLinear(offset, maxtrixPosition.y, itemLoanLength)
    return isNaN(estimate) ? 'unknown' : estimate
  } else {
    return 'unknown'
  }
}

function estimateLinear (offset, queuePlace, loanWeeks) {
  const queue = (offset <= loanWeeks) ? (queuePlace - 1) : queuePlace
  return offset + (loanWeeks * (queue))
}

function getOffsetInWeeks (date) {
  const currentDate = Date.now()
  const parsedDate = Date.parse(date)
  if (isNaN(parsedDate)) {
    return 0
  }
  if (parsedDate <= currentDate) {
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
