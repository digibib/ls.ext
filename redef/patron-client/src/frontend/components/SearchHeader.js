import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
import { injectIntl, defineMessages, FormattedMessage, FormattedHTMLMessage } from 'react-intl'

let SearchHeader = React.createClass({
  propTypes: {
    locationQuery: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  },
  contextTypes: {
    router: React.PropTypes.object
  },
  componentWillMount () {
    this.setState({ searchFieldInput: this.props.locationQuery.query })
  },
  getInitialState () {
    return {
      searchFieldInput: ''
    }
  },
  handleChange (event) {
    this.setState({ searchFieldInput: event.target.value })
  },
  search (event) {
    event.preventDefault()
    let url = this.context.router.createPath({ pathname: '/search', query: { query: this.state.searchFieldInput } })
    this.props.dispatch(push(url))
  },
  render () {
    debugger
    return (
      <header className='row'>
        <div className='container'>
          <div className='col'>
            <Link to='/'>
              <img
                className='logo'
                width='164'
                height='24px'
                src='/logo.png'/>
            </Link>
          </div>
          <div className='col'>
            <form onSubmit={this.search}>
              <input placeholder={this.props.intl.formatMessage({...messages.searchInputPlaceholder})}
                     id='search'
                     type='search'
                     value={this.state.searchFieldInput}
                     onChange={this.handleChange}
              />
              <button type='submit' id='submit'>
                <FormattedMessage {...messages.search} />
              </button>
            </form>
          </div>
        </div>
      </header>
    )
  }
})

const messages = defineMessages({
  searchInputPlaceholder: {
    id: 'SearchHeader.searchInputPlaceholder',
    description: 'Placeholder for the search field',
    defaultMessage: 'Search for something...'
  },
  search: {
    id: 'SearchHeader.search',
    description: 'Label on search button',
    defaultMessage: 'Search'
  }
})

export default injectIntl(SearchHeader)
