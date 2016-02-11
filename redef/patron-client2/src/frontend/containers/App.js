import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import SearchHeader from '../components/SearchHeader'

const App = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    routing: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired
  },
  render () {
    return (
      <div>
        <SearchHeader locationQuery={this.props.location.query} dispatch={this.props.dispatch}/>
        {this.props.children}
      </div>
    )
  }
})

function mapStateToProps (state) {
  return {
    routing: state.routing
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
