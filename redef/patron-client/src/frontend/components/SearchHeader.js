import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { push } from 'react-router-redux'

export default React.createClass({
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
              <input placeholder='søk etter noe da...'
                     id='search'
                     type='search'
                     value={this.state.searchFieldInput}
                     onChange={this.handleChange}
              />
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
