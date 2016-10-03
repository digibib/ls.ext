export function action (type, payload) {
  return {
    type,
    payload: payload
  }
}

export function errorAction (type, error) {
  console.log(error)
  return {
    type,
    payload: error,
    error: true
  }
}
