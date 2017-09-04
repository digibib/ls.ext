import React, {PropTypes} from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import {Link} from 'react-router'
import {push} from 'react-router-redux'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'
import MediaQuery from 'react-responsive'
import LuceneParser from 'lucene-query-parser'
import {queryFieldTranslations} from '../constants/Constants'

class SearchHeader extends React.Component {
  constructor (props) {
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleLoginClick = this.handleLoginClick.bind(this)
    this.toggleMobileNav = this.toggleMobileNav.bind(this)
    this.handleRegistrationClick = this.handleRegistrationClick.bind(this)
    this.checkQuery = this.checkQuery.bind(this)
    this.state = { querySyntaxError: false, unknownFields: {}, searchFieldInput: '' }
  }

  componentDidUpdate (prevprops, prevState) {
    if (this.state.searchFieldInput === '' || prevprops.locationQuery.query !== this.props.locationQuery.query) {
      this.state.searchFieldInput = this.props.locationQuery.query || ''
    }
  }

  checkQuery (event) {
    const unknownFields = []

    function traverse (node) {
      if (node.left) {
        traverse(node.left)
      }
      if (node.field && node.field !== '<implicit>') {
        if (!{ ...queryFieldTranslations, '*': '*' }[ node.field ]) {
          unknownFields[ node.field ] = {}
        }
      }
      if (node.right) {
        traverse(node.right)
      }
    }

    const searchFieldInput = event.target.value
    try {
      traverse(LuceneParser.parse(event.target.value))
      this.setState(prevState => {
        return {
          ...prevState,
          querySyntaxError: false,
          unknownFields,
          searchFieldInput
        }
      })
    } catch (err) {
      console.log(err)
      this.setState(prevState => ({
        ...prevState,
        querySyntaxError: true,
        unknownFields: {},
        searchFieldInput
      }))
    }
  }

  handleSearch (event) {
    event.preventDefault()
    if (!this.state.querySyntaxError) {
      this.state.unknownFields = {}

      // Ensure that page-param is deleted on new search
      delete this.props.locationQuery[ 'page' ]
      this.props.mobileNavigationActions.hideMobileNavigation()

      /* Active filters are removed on new query */
      if (this.props.path.includes('/work')) {
        this.props.dispatch(push({ pathname: '/search', query: { query: this.state.searchFieldInput } }))
      } else {
        /* Active filters are NOT removed on new query */
        this.props.locationQuery.query = this.state.searchFieldInput
        this.props.dispatch(push({ pathname: '/search', query: this.props.locationQuery }))
      }
      this.props.searchActions.search()
    }
  }

  handleLoginClick (event) {
    event.preventDefault()
    this.props.mobileNavigationActions.hideMobileNavigation()
    this.props.showLoginDialog(push({ pathname: '/profile/loans' }))
  }

  handleRegistrationClick (event) {
    event.preventDefault()
    this.props.startRegistration()
  }

  toggleMobileNav () {
    this.props.mobileNavigationActions.toggleMobileNavigation()
  }

  /**
   * Links used in the menu and the mobile menu
   */
  loginLink () {
    if (!this.props.isLoggedIn) {
      return [
        <li key={2} data-automation-id="login_element" onClick={this.handleLoginClick} >
          <Link to="/" >
            <FormattedMessage {...messages.logIn} /> <span >&raquo;</span >
          </Link >
        </li >
      ]
    }
  }

  logoutLink () {
    if (this.props.isLoggedIn) {
      return [
        <li key={1} data-automation-id="logout_element" onClick={this.props.logout} >
          <Link to="/" >
            <FormattedMessage {...messages.logout} /> <span >&raquo;</span >
          </Link >
        </li >
      ]
    }
  }

  profileLink () {
    if (this.props.isLoggedIn) {
      return [
        <li key={3} >
          <Link to="/profile/loans" ><FormattedMessage {...messages.myProfile} /> <span >&raquo;</span ></Link >
        </li >
      ]
    }
  }

  registrationLink () {
    if (!this.props.isLoggedIn) {
      return (
        <li data-automation-id="registration_element" >
          <a href="#" onClick={this.handleRegistrationClick}
             title="register" ><FormattedMessage {...messages.register} /><span >&raquo;</span ></a >
        </li >
      )
    }
  }

  faqLink () {
    return (
      <li >
        <a href="https://www.deichman.no/sp%C3%B8rsm%C3%A5l_og_svar_nytt_biblioteksystem" >
          <FormattedMessage {...messages.faq} />
          <span >&raquo;</span >
        </a >
      </li >
    )
  }

  loggedInMessage () {
    const { borrowerName } = this.props
    return (
      <span >
        <FormattedMessage {...messages.loggedInAs} /> <strong ><span
        data-automation-id="borrowerName" >{borrowerName}</span ></strong >
      </span >
    )
  }

  /**
   * Renders the menu, and/or the mobile menu
   */
  renderNavigationLinks () {
    const { borrowerName } = this.props
    return (
      <ul >
        {this.faqLink()}
        {this.profileLink()}
        {this.registrationLink()}
        {borrowerName
          ? (
            <MediaQuery query="(min-width: 992px)" values={{ ...this.props.mediaQueryValues }} >
              <li >{this.loggedInMessage()}</li >
            </MediaQuery >
          )
          : null}
        {this.loginLink()}
        {this.logoutLink()}
      </ul >
    )
  }

  renderMobileNavigationLinks () {
    return (
      <ul >
        {this.faqLink()}
        {this.profileLink()}
        {this.registrationLink()}
        {this.loginLink()}
        {this.logoutLink()}
      </ul >
    )
  }

  render () {
    const { borrowerName } = this.props
    const mobileNavClass = this.props.showMobileNavigation ? 'primary-mobile-menu' : 'primary-mobile-menu collapsed'
    return (
      <div >
        <NonIETransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="header"
          className="wrapper" >

          <div className="logo" >
            <a href="https://www.deichman.no/" >
              <img src="/images/logo.png" alt={this.props.intl.formatMessage(messages.logoAlt)} />
            </a >
          </div >

          <MediaQuery query="(max-width: 667px)" values={{ ...this.props.mediaQueryValues }} >
            <div className="mobile-menu-toggle" >
              <img className="btn-mobile-toggle" src="/images/btn-mobile.svg" alt="3 black bars"
                   onClick={this.toggleMobileNav} />
            </div >
          </MediaQuery >

          <MediaQuery query="(min-width: 668px)" values={{ ...this.props.mediaQueryValues }} >
            <nav className="primary-menu" >
              {this.renderNavigationLinks()}
            </nav >
          </MediaQuery >

          {borrowerName
            ? (<MediaQuery query="(max-width: 991px)" values={{ ...this.props.mediaQueryValues }} >
              <div className="logged-in-message" >
                {this.loggedInMessage()}
              </div >
            </MediaQuery >)
            : null}

        </NonIETransitionGroup >

        <MediaQuery query="(max-width: 667px)" values={{ ...this.props.mediaQueryValues }} >
          <nav className={mobileNavClass} >
            {this.renderMobileNavigationLinks()}
          </nav >
        </MediaQuery >

        <NonIETransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="section"
          className="search-box-wrapper"
          role="search" >
          <div className="search-box" >
            <form onSubmit={this.handleSearch} >
              <label htmlFor="search" >{this.props.intl.formatMessage(messages.searchLabel)}:</label >
              <div className="search-field-wrapper" >
                <div className="search-field" >
                  <input placeholder={this.props.intl.formatMessage(messages.searchInputPlaceholder)}
                         id="search"
                         type="text"
                         defaultValue={this.props.locationQuery.query || ''}
                         value={this.state.searchFieldInput}
                         onChange={this.checkQuery}
                         data-automation-id="search_input_field"
                  />
                </div >
                <div className="search-button" >
                  <button onClick={this.handleSearch} type="button" className="search-submit"
                          data-automation-id="search_button" disabled={this.state.querySyntaxError} >
                    {!this.props.isSearching
                      ? <FormattedMessage {...messages.search} />
                      : <span data-automation-id="is_searching" className="loading-spinner" >
                          <i className="icon-spin4 animate-spin" style={{ color: '#fff' }} />
                        </span >
                    }
                  </button >
                </div >
              </div >
            </form >
          </div >
          {Object.keys(this.state.unknownFields).length > 0
            ? <div className="search-syntax-error" >
              <div className="message" >
                <FormattedMessage {...Object.assign(messages.unknownFields, { values: { unrecognizedFields: Object.keys(this.state.unknownFields).map(field => `"${field}"`).join(', ') } })} />
              </div >
            </div >
            : ''
          }
          {this.state.querySyntaxError
            ? <div className="search-syntax-error" >
              <div className="message" ><FormattedMessage {...messages.luceneSyntaxError} /></div >
            </div >
            : ''
          }
        </NonIETransitionGroup >
      </div >
    )
  }
}

SearchHeader.propTypes = {
  locationQuery: PropTypes.object.isRequired,
  requireLoginBeforeAction: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
  showLoginDialog: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  mediaQueryValues: PropTypes.object,
  intl: intlShape.isRequired,
  startRegistration: PropTypes.func.isRequired,
  showMobileNavigation: PropTypes.bool.isRequired,
  mobileNavigationActions: PropTypes.object.isRequired,
  searchActions: PropTypes.object.isRequired,
  isSearching: PropTypes.bool.isRequired,
  borrowerName: PropTypes.string,
  path: PropTypes.string.isRequired
}

export const messages = defineMessages({
  logoAlt: {
    id: 'SearchHeader.logoAlt',
    description: 'Alt text for the logo',
    defaultMessage: 'Black logo with text'
  },
  myProfile: {
    id: 'SearchHeader.myProfile',
    description: 'Label for the link to go to the user profile',
    defaultMessage: 'My profile'
  },
  myLoans: {
    id: 'SearchHeader.myLoans',
    description: 'Label for the link to go to the users loans',
    defaultMessage: 'My loans'
  },
  more: {
    id: 'SearchHeader.more',
    description: 'Label for the link to show more',
    defaultMessage: 'More'
  },
  contactUs: {
    id: 'SearchHeader.contactUs',
    description: 'Label for the link to go to the contact page',
    defaultMessage: 'Contact us'
  },
  searchInputPlaceholder: {
    id: 'SearchHeader.searchInputPlaceholder',
    description: 'Placeholder for the search field',
    defaultMessage: 'Search by title, author, subject, or other keywords'
  },
  searchLabel: {
    id: 'SearchHeader.searchLabel',
    description: 'Label for the main search bar',
    defaultMessage: 'Search the collections'
  },
  search: {
    id: 'SearchHeader.search',
    description: 'Label on search button',
    defaultMessage: 'Search'
  },
  logout: {
    id: 'Navigation.logout',
    description: 'Shown when logged in',
    defaultMessage: 'Log out'
  },
  logIn: {
    id: 'Navigation.logIn',
    description: 'Shown when logged out',
    defaultMessage: 'Log in'
  },
  register: {
    id: 'Navigation.register',
    description: 'Register link in main menu',
    defaultMessage: 'Register'
  },
  faq: {
    id: 'Navigation.faq',
    description: 'Faq link in main menu',
    defaultMessage: 'FAQ'
  },
  loggedInAs: {
    id: 'Navigation.loggedInAs',
    description: 'Shown then logged',
    defaultMessage: 'Logged in as:'
  },
  luceneSyntaxError: {
    id: 'Search.querySyntaxError',
    description: 'Shown when search query does not conform to lucene syntax',
    defaultMessage: `It looks like you want to perform an advanced search with field codes, but the query is not quite right. 
    Check that any parentheses and quotes match and note that colon (":") is meant to be used to specify a field. 
    If you want to search for anything with a colon or any other special symbols, try enclosing it in quotes (")`
  },
  unknownFields: {
    id: 'Search.unknownField',
    description: 'Shown when an unknown field i specified',
    defaultMessage: `It looks like you want to perform an advanced search with field codes, but you have specified one or more fields that are we don't recognize:{unrecognizedFields}
    We suggest you replace these with recognized field codes, otherwise the search may turn up empty`
  }
})

export default injectIntl(SearchHeader)
