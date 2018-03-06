import React, {PropTypes} from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import {Link} from 'react-router'
import {push} from 'react-router-redux'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'
import MediaQuery from 'react-responsive'

class SearchHeader extends React.Component {
  constructor (props) {
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleLoginClick = this.handleLoginClick.bind(this)
    this.toggleMobileNav = this.toggleMobileNav.bind(this)
  }

  componentDidUpdate (prevprops, prevState) {
    if (prevprops.locationQuery.query !== this.props.locationQuery.query) {
      this.searchFieldInput.value = this.props.locationQuery.query || ''
    }
  }

  handleSearch (event) {
    event.preventDefault()

    // Ensure that page-param is deleted on new search
    delete this.props.locationQuery[ 'page' ]
    this.props.mobileNavigationActions.hideMobileNavigation()

    /* Active filters are removed on new query */
    if (this.props.path.includes('/work')) {
      this.props.dispatch(push({ pathname: '/search', query: { query: this.searchFieldInput.value } }))
    } else {
      /* Active filters are NOT removed on new query */
      this.props.locationQuery.query = this.searchFieldInput.value
      this.props.dispatch(push({ pathname: '/search', query: this.props.locationQuery }))
      this.props.searchActions.search()
    }
  }

  handleLoginClick (event) {
    event.preventDefault()
    this.props.mobileNavigationActions.hideMobileNavigation()
    push({pathname: '/login'})
  }

  toggleMobileNav () {
    this.props.mobileNavigationActions.toggleMobileNavigation()
  }

  /**
   * Links used in the menu and the mobile menu
   */

  yourLibraryLink () {
    return (
      <a href="https://www.deichman.no/bibliotekene">
        <FormattedMessage {...messages.yourLibrary} /> <span >&raquo;</span >
      </a>
    )
  }

  loginLink () {
    if (!this.props.isLoggedIn) {
      return [
        <li key={2} data-automation-id="login_element" onClick={this.handleLoginClick} >
          <Link to="/login" >
            <MediaQuery query="(min-width: 1050px)" values={{ ...this.props.mediaQueryValues }} >
              <img className="icon" src="/images/profile24.svg" />
            </MediaQuery>
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
          <MediaQuery query="(min-width: 1050px)" values={{ ...this.props.mediaQueryValues }} >
            <img className="icon" src="/images/profile24.svg" />
          </MediaQuery>
          <Link data-automation-id="my-page-link" to="/profile/loans" ><FormattedMessage {...messages.myProfile} /> <span >&raquo;</span ></Link >
        </li >
      ]
    }
  }

  registrationLink () {
    if (!this.props.isLoggedIn) {
      return (
        <li key={4} data-automation-id="registration_element" >
          <Link to="/register"
             title="register" ><FormattedMessage {...messages.register} /><span >&raquo;</span ></Link>
        </li >
      )
    }
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
    return (
      <ul >
        {this.profileLink()}
        {this.registrationLink()}
        { /* borrowerName
          ? (
            <MediaQuery query="(min-width: 992px)" values={{ ...this.props.mediaQueryValues }} >
              <li >{this.loggedInMessage()}</li >
            </MediaQuery >
          )
          : null */}
        {this.loginLink()}
        {this.logoutLink()}
      </ul >
    )
  }

  renderMobileNavigationLinks () {
    return (
      <ul >
        <li key={0} >
          {this.yourLibraryLink()}
        </li>
        {this.profileLink()}
        {this.registrationLink()}
        {this.loginLink()}
        {this.logoutLink()}
      </ul >
    )
  }

  renderSearchField () {
    return (
      <MediaQuery query="(min-width: 1050px)" values={{ ...this.props.mediaQueryValues }} >
        {(matches) => {
          let placeholder = ''
          if (matches) {
            placeholder = this.props.intl.formatMessage(messages.searchInputPlaceholder)
          }
          return <input placeholder={placeholder}
                    id="search"
                    type="text"
                    defaultValue={this.props.locationQuery.query || ''}
                    ref={e => this.searchFieldInput = e}
                    data-automation-id="search_input_field"
                  />
        }}
      </MediaQuery >
    )
  }

  render () {
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
          className="search-header" >

          <MediaQuery query="(min-width: 1050px)" values={{ ...this.props.mediaQueryValues }} >
            <div className="your-library-link" >
              <p>{this.yourLibraryLink()}</p>
            </div >
          </MediaQuery >

          <div className="logo" >
            <a href="https://www.deichman.no/">
              <img className="logo-deichman" src="/images/logo_negative.svg" alt={this.props.intl.formatMessage(messages.logoAlt)} />
            </a >
          </div >

          <MediaQuery query="(max-width: 1049px)" values={{ ...this.props.mediaQueryValues }} >
            <div className="mobile-menu-toggle" >
              <img className="btn-mobile-toggle" src="/images/btn-mobile.svg" alt="3 black bars"
                   onClick={this.toggleMobileNav} />
            </div >
          </MediaQuery >

          <MediaQuery query="(min-width: 1050px)" values={{ ...this.props.mediaQueryValues }} >
            <nav className="primary-menu" >
              {this.renderNavigationLinks()}
            </nav >
          </MediaQuery >

          { /* borrowerName
            ? (<MediaQuery query="(max-width: 991px)" values={{ ...this.props.mediaQueryValues }} >
              <div className="logged-in-message" >
                {this.loggedInMessage()}
              </div >
            </MediaQuery >)
            : null */ }

        </NonIETransitionGroup >

        <MediaQuery query="(max-width: 1049px)" values={{ ...this.props.mediaQueryValues }} >
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
          role="search">
          <div className="search-box wrapper" >
            <form onSubmit={this.handleSearch} >
              <label htmlFor="search" >{this.props.intl.formatMessage(messages.searchLabel)}</label >
              <div className="search-field-wrapper" >
                <div className="search-field" >
                  {this.renderSearchField()}
                </div >
                <div className="search-button" >
                  <button onClick={this.handleSearch} type="button" className="search-submit"
                          data-automation-id="search_button" >
                  <img src="/images/search16.svg" />
                  </button >
                </div >
              </div >
            </form >
          </div >
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
    defaultMessage: 'Deichman logo'
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
  loggedInAs: {
    id: 'Navigation.loggedInAs',
    description: 'Shown then logged',
    defaultMessage: 'Logged in as:'
  },
  yourLibrary: {
    id: 'Navigation.yourLibrary',
    description: 'Link label to your library',
    defaultMessage: 'Your library'
  }
})

export default injectIntl(SearchHeader)
