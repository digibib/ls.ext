import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SearchHeader from '../components/SearchHeader'
import * as LanguageActions from '../actions/LanguageActions'

const App = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    routing: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    languageActions: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired,
    totalHits: PropTypes.number.isRequired
  },
  componentWillMount () {
    this.props.languageActions.loadLanguage()
  },
  render () {
    return (
      <div>
        <SearchHeader locationQuery={this.props.location.query} dispatch={this.props.dispatch}
                      loadLanguage={this.props.languageActions.loadLanguage}
                      locale={this.props.locale}
                      totalHits={this.props.totalHits}
        />
        {this.props.children}
      </div>
    )
  }
})

function mapStateToProps (state) {
  return {
    routing: state.routing,
    locale: state.application.locale,
    totalHits: state.search.totalHits
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    languageActions: bindActionCreators(LanguageActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
