import React from 'react'

export default React.createClass({
  render () {
    return (
      <footer className='search-footer'>
        <nav className='secondary-navigation' type='navigation'>
          <ul>
            <li>Kontakt oss</li>
            <li>Åpningstider</li>
            <li>In English</li>
            <li>Om Oss</li>
          </ul>
        </nav>
        <div className='footer-text'>
          <p>
            Deichmanske bibliotek <br />
            Oslo kommune <br />
            Arne Garborgs plass 40179 Oslo <br />
            Telefon: +47 23 43 29 00 <br />
            Redaktør: Kristin Danielsen (biblioteksjef) <br />
          </p>
        </div>
        <div className='footer-icon'>
          <img src='/images/footer-icon.svg' alt='White box with black circle' />
        </div>
      </footer>
    )
  }
})
