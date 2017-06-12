const mergeArraysOfObjects = (a, b, prop) => {
  const reduced =  a.filter( aitem => ! b.find ( bitem => aitem[prop] === bitem[prop]) )
  return reduced.concat(b);
}

export default mergeArraysOfObjects