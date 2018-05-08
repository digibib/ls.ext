import PropTypes from 'prop-types'
import React from 'react'

class Libraries extends React.Component {
  constructor (props) {
    super(props)
    this.handleSelectChange = this.handleSelectChange.bind(this)
  }

  renderOptions () {
    const branchOptions = []
    const { libraries } = this.props
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

  handleSelectChange () {
    this.props.onChangeAction(this.props.reserveId, this.select.value)
  }

  render () {
    const { selectProps, selectedBranchCode, onChangeAction, disabled } = this.props
    return (
      <select ref={e => this.select = e} {...selectProps}
              defaultValue={selectedBranchCode}
              onChange={onChangeAction ? this.handleSelectChange : undefined}
              disabled={disabled}
              data-automation-id="libraries">
        {this.renderOptions()}
      </select>
    )
  }
}

Libraries.propTypes = {
  libraries: PropTypes.object.isRequired,
  selectProps: PropTypes.object,
  selectedBranchCode: PropTypes.string,
  reserveId: PropTypes.string,
  onChangeAction: PropTypes.func,
  disabled: PropTypes.bool
}

export default Libraries
