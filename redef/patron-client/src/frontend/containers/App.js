import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SearchHeader from '../components/SearchHeader'
import * as LanguageActions from '../actions/LanguageActions'

import * as LoginActions from '../actions/LoginActions'
import ModalRoot from './ModalRoot'
import Footer from '../components/Footer'

const App = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    routing: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    languageActions: PropTypes.object.isRequired,
    loginActions: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired,
    totalHits: PropTypes.number.isRequired,
    isLoggedIn: PropTypes.bool.isRequired
  },
  componentWillMount () {
    this.props.loginActions.updateLoginStatus()
    this.props.languageActions.loadLanguage()
  },
  render () {
    return (
      <div>
        <ModalRoot />
        <div className='outer-container'>
        <SearchHeader locationQuery={this.props.location.query} dispatch={this.props.dispatch}
                      loadLanguage={this.props.languageActions.loadLanguage}
                      locale={this.props.locale}
                      totalHits={this.props.totalHits}
                      isLoggedIn={this.props.isLoggedIn}
                      logout={this.props.loginActions.logout}
                      showLoginDialog={this.props.loginActions.showLoginDialog}
        />
        {this.props.children}
          </div>
        <Footer />
      </div>
    )
  }
})

function mapStateToProps (state) {
  return {
    routing: state.routing,
    locale: state.application.locale,
    isLoggedIn: state.application.isLoggedIn,
    totalHits: state.search.totalHits
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    languageActions: bindActionCreators(LanguageActions, dispatch),
    loginActions: bindActionCreators(LoginActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
