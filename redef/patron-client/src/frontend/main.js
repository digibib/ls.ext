import '../../public/dist/styles/main.css'
import React from 'react'
import ReactDOM from 'react-dom'
import configureStore from './store'
import Root from './containers/Root'
import { addLocaleData } from 'react-intl'
import en from 'react-intl/locale-data/en'
import no from 'react-intl/locale-data/no'
import { Provider } from 'react-redux'
import routes from './routes'

const store = configureStore()

const areIntlLocalesSupported = require('intl-locales-supported')

const localesMyAppSupports = [
  'en', 'nb'
]

function applyPolyfill () {
  const IntlPolyfill = require('intl')
  Intl.NumberFormat = IntlPolyfill.NumberFormat
  Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
  require('intl/locale-data/jsonp/en.js')
  require('intl/locale-data/jsonp/nb.js')
  return IntlPolyfill
}

if (global.Intl) {
  if (!areIntlLocalesSupported(localesMyAppSupports)) {
    applyPolyfill()
  }
} else {
  global.Intl = applyPolyfill()
}

addLocaleData(en)
addLocaleData(no)

ReactDOM.render(<Provider store={store}><Root routes={routes(store)} /></Provider>, document.getElementById('app'))
