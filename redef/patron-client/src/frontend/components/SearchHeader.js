import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

class SearchHeader extends React.Component {
  constructor (props) {
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleLoginClick = this.handleLoginClick.bind(this)
  }

  handleSearch (event) {
    event.preventDefault()
    this.props.dispatch(push({ pathname: '/search', query: { query: this.searchFieldInput.value } }))
  }

  handleLoginClick (event) {
    event.preventDefault()
    this.props.showLoginDialog()
  }

  render () {
    return (
      <div>
        <header className='row'>
          <div className='container'>
            <div className='logo'>
              <Link to='/'>
                <img src='/images/logo.png' alt={this.props.intl.formatMessage(messages.logoAlt)} />
              </Link>
            </div>
            <button type='button' className='btn-mobile'>
              <Link to='/'>
                <img src='/images/btn-mobile.svg' alt='3 black bars' />
              </Link>
            </button>
            <div className='primary-menu'>
              <ul>
                <li><Link to='/profile'><FormattedMessage {...messages.myProfile} /></Link></li>
                {this.props.isLoggedIn
                  ? <li data-automation-id='logout_element' onClick={this.props.logout}>
                  <FormattedMessage { ...messages.logout } /></li>
                  : <li data-automation-id='login_element' onClick={this.handleLoginClick}>
                  <FormattedMessage {...messages.logIn } /></li>}
              </ul>
            </div>
          </div>
        </header>
        <section className='search-container'>
          <div className='search-box'>
            <form onSubmit={this.handleSearch}>
              <label htmlFor='search'><img src='/images/icon-searchbar-search.svg'
                                           alt='Black Magnifying glass' /></label>
              <input placeholder={this.props.intl.formatMessage(messages.searchInputPlaceholder)}
                     type='search'
                     defaultValue={this.props.locationQuery.query || ''}
                     ref={e => this.searchFieldInput = e}
                     data-automation-id='search_input_field'
              />
              <button onClick={this.handleSearch} type='button' className='search-submit'
                      data-automation-id='search_button'>
                <FormattedMessage {...messages.search} />
              </button>
            </form>
          </div>
        </section>
      </div>
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
  intl: intlShape.isRequired
}

const messages = defineMessages({
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
    defaultMessage: 'Search for something...'
  },
  search: {
    id: 'SearchHeader.search',
    description: 'Label on search button',
    defaultMessage: 'Search'
  },
  logout: {
    id: 'SearchHeader.logout',
    description: 'Shown when logged in',
    defaultMessage: 'Log out'
  },
  logIn: {
    id: 'SearchHeader.logIn',
    description: 'Shown when logged out',
    defaultMessage: 'Log in'
  }
})

export default injectIntl(SearchHeader)
