import '../../public/dist/styles/main.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import Root from './containers/Root'
import { addLocaleData } from 'react-intl'
import en from 'react-intl/locale-data/en'
import no from 'react-intl/locale-data/no'

const areIntlLocalesSupported = require('intl-locales-supported')

const localesMyAppSupports = [
  'en', 'nb'
]

function applyPolyfill () {
  const IntlPollyfill = require('intl')
  Intl.NumberFormat = IntlPollyfill.NumberFormat
  Intl.DateTimeFormat = IntlPollyfill.DateTimeFormat
  require('intl/locale-data/jsonp/en.js')
  require('intl/locale-data/jsonp/nb.js')
  return IntlPollyfill
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

ReactDOM.render(<Provider store={store}><Root /></Provider>, document.getElementById('app'))
