import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import LinkedStateMixin from 'react-addons-linked-state-mixin'
import { routeActions } from 'react-router-redux'

export default React.createClass({
  propTypes: {
    locationQuery: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  },
  mixins: [ LinkedStateMixin ],
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
  search (event) {
    event.preventDefault()
    var url = this.context.router.createPath({ pathname: '/search', query: { query: this.state.searchFieldInput } })
    this.props.dispatch(routeActions.push(url))
  },
  render () {
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
              <input
                placeholder='søk etter noe da...'
                id='search'
                type='search'
                valueLink={this.linkState('searchFieldInput')}/>
              <button type='submit' id='submit'>
                søk
              </button>
            </form>
          </div>
        </div>
      </header>
    )
  }
})
