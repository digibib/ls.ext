import React from 'react'
import { Link } from 'react-router'

import { predefinedQueries } from '../constants/Constants.js'

class SearchLinks extends React.Component {

  render () {
    return (
      <div className="search-links">
        <ul className="wrapper">
          {
            predefinedQueries.map(q => {
              return (
                <Link to={q.query} key={q.query}>
                  <li>
                    <img src={q.image} />
                    <h2>{q.title}</h2>
                    <p>{q.desc}</p>
                    <img className="arrow" src="/images/long_arrow_right.svg" />
                  </li>
                </Link>
              )
            })
          }
        </ul>
      </div>
    )
  }
}

export default SearchLinks
