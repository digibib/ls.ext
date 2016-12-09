import React, { PropTypes } from 'react'

const Title = ({title}) => (
  <h1>{title}</h1>
)

Title.propTypes = {
  title: PropTypes.string
}

export default Title
