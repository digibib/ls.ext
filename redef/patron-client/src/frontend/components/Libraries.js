import React, { PropTypes } from 'react'

class Libraries extends React.Component {
  renderOptions () {
    const branchOptions = []
    const libraries = this.props.libraries
    Object.keys(libraries).forEach(branchCode => {
      const branchName = libraries[ branchCode ]
      branchOptions.push(
        <option key={branchCode} value={branchCode}>
          {branchName}
        </option>
      )
    })
    return branchOptions
  }

  getValue () {
    return this.select.value
  }

  render () {
    const { selectProps } = this.props
    return (
      <select ref={e => this.select = e} {...selectProps}>
        {this.renderOptions()}
      </select>
    )
  }
}

Libraries.propTypes = {
  libraries: PropTypes.object.isRequired,
  selectProps: PropTypes.object
}

export default Libraries
