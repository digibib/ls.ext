import 'es5-shim'
import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import Root from './containers/Root'
import { addLocaleData } from 'react-intl'
import en from 'react-intl/locale-data/en'
import no from 'react-intl/locale-data/no'

addLocaleData(en)
addLocaleData(no)

ReactDOM.render(<Provider store={store}><Root /></Provider>, document.getElementById('app'))
