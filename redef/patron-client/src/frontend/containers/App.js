import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SearchHeader from '../components/SearchHeader'
import * as LanguageActions from '../actions/LanguageActions'
import * as LibraryActions from '../actions/LibraryActions'

import * as LoginActions from '../actions/LoginActions'
import ModalRoot from './ModalRoot'
import Footer from '../components/Footer'

class App extends React.Component {
  componentWillMount () {
    this.props.loginActions.updateLoginStatus()
    this.props.languageActions.loadLanguage()
    this.props.libraryActions.fetchLibraries()
  }

  render () {
    return (
      <div>
        <ModalRoot />
        <div className='outer-container'>
          <SearchHeader locationQuery={this.props.location.query}
                        dispatch={this.props.dispatch}
                        locale={this.props.locale}
                        isLoggedIn={this.props.isLoggedIn}
                        logout={this.props.loginActions.logout}
                        showLoginDialog={this.props.loginActions.showLoginDialog}
                        requireLoginBeforeAction={this.props.loginActions.requireLoginBeforeAction}
          />
          {this.props.children}
        </div>
        <Footer loadLanguage={this.props.languageActions.loadLanguage} locale={this.props.locale} />
      </div>
    )
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  routing: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  languageActions: PropTypes.object.isRequired,
  libraryActions: PropTypes.object.isRequired,
  loginActions: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  isLoggedIn: PropTypes.bool.isRequired
}

function mapStateToProps (state) {
  return {
    routing: state.routing,
    locale: state.application.locale,
    isLoggedIn: state.application.isLoggedIn
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    languageActions: bindActionCreators(LanguageActions, dispatch),
    loginActions: bindActionCreators(LoginActions, dispatch),
    libraryActions: bindActionCreators(LibraryActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
