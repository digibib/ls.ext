module.exports.estimateWaitingPeriod = (queuePlace, items) => {
  function isInTransit (queuePlace) {
    return (queuePlace === 0)
  }

  function getReservableItems (items) {
    return items.filter((item) => { return item.reservable === 1 })
  }

  function isPotentiallyPrecededByZeroBorrower (dateLastSeen) {
    // Here I make an assumption that if the last seen date isn't null or within the last three days,
    // someone has priority '0', which means that the current user's  priority is bumped, but not about to be
    // effectuated. This fixes an error where we assume that a user is first in the queue and the item.onloan property
    // is null indicating that it is available, when in fact it is simply not allocated to borrower with priority '0'.
    // The remainder operator here figures out if we need to adjust for a weekend
    const day = new Date(Date.now()).getDay()
    const waitDays = (day === 0 || day === 6) ? 5 : 3
    return dateLastSeen === null ? false : (Date.now() - Date.parse(dateLastSeen)) < (1000 * 60 * 60 * 24 * waitDays)
  }

  function getAvailable (items) {
    return getReservableItems(items).filter((item) => { return item.onloan === null })
  }

  const reservableItems = getReservableItems(items)

  if (reservableItems.length < 1) {
    return 'unknown'
  }

  if (isInTransit(queuePlace)) {
    return 'inTransit'
  }

  const availableItems = getAvailable(items)

  if (queuePlace <= availableItems.length && !isPotentiallyPrecededByZeroBorrower(availableItems[ 0 ].datelastseen)) {
    return 'pending'
  } else {
    return getEstimateString(queuePlace, reservableItems)
  }

  function getEstimateString (queuePlace, items) {
    const queued = queuePlace || 1
    const estimate = getEstimate(queued, items)

    if (estimate === 'unknown') {
      return estimate
    }

    const floor = Math.floor(estimate)
    return (floor < 11) ? `${floor}–${floor + 2}` : '10'
  }

  function generateMatrix (queuePlace, items) {
    const pointValues = Array.apply(null, { length: queuePlace }).map(Number.call, Number)
    const matrix = []
    let i = 0
    while (pointValues.length) {
      matrix[ i ] = pointValues.splice(0, items)
      i++
    }
    return { x: matrix.length, y: matrix[ 0 ].length }
  }

  function getEstimate (queuePlace, items) {
    if (items) {
      const itemLoanLength = getLoanPeriod(items[ 0 ].itype)

      if (queuePlace > (items.length * (12 / itemLoanLength))) {
        return 12
      }

      if (items.length === 1 || queuePlace === 1) {
        return getLinearEstimate(
          getOffsetInWeeks(items[ 0 ].onloan),
          queuePlace,
          getLoanPeriod(items[ 0 ].itype, null),
          items[ 0 ].datelastseen)
      }

      const matrixPosition = generateMatrix(queuePlace, items.length)
      const targetItem = matrixPosition.y - 1
      const estimate = getLinearEstimate(
        getOffsetInWeeks(items[ targetItem ].onloan),
        matrixPosition.x,
        itemLoanLength,
        items[ targetItem ].datelastseen)

      return isNaN(estimate) ? 'unknown' : estimate
    } else {
      return 'unknown'
    }
  }

  function getLinearEstimate (offset, queuePlace, loanWeeks, dateLastSeen) {
    const queue = (offset <= loanWeeks && !isPotentiallyPrecededByZeroBorrower(dateLastSeen)) ? (queuePlace - 1) : queuePlace
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
}
