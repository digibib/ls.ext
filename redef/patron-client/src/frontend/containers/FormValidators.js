import React from 'react'

export default ComposedComponent => class extends React.Component {
  asyncValidate(values/*, dispatch*/) {
    return new Promise((resolve, reject) => {
      fetch('/api/v1/validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }, body: JSON.stringify({ values: values })
      }).then(response => response.json())
        .then(json => {
          if (Object.keys(json.errors).length === 0) {
            resolve()
          } else {
            reject(json.errors)
          }
        })
    })
  }
  render () {
    return <ComposedComponent {...this.props} asyncValidate={this.asyncValidate} />
  }
}