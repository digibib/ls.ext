/**
 * Created by Nikolai on 05/09/16.
 */
import React, {PropTypes} from 'react'
import {injectIntl, intlShape} from 'react-intl'
import ClickableElement from '../components/ClickableElement'

const SearchFilterBoxItem = ({filter, toggleFilter, intl}) => {
    return (
        <ClickableElement onClickAction={toggleFilter} onClickArguments={[filter.id]}>
            <li
                data-automation-id={filter.id}
                style={{listStyle: 'none', overflow: 'hidden', background: 'lightgray', display: 'inline-block', marginBottom: '0.5em', marginRight: '0.5em', paddingBottom: '0.2em', paddingLeft: '0.2em', paddingTop: '0em', verticalAlign: 'middle', border: '1px black solid', borderRadius: '0.2em'}}>
                <h2 className='filter_label' data-automation-id='filter_label'>
                    {intl.formatMessage({id: filter.bucket})}{/* ({filter.count}) */}
                </h2>
                <span style={{color: 'red', borderLeft: "1px solid black", paddingTop: '0.3em', paddingBottom: '0.3em', paddingRight: '0.4em', paddingLeft: '0.4em', fontWeight: 'bold', margin:'0', overflow: 'hidden', height: 'match-parent'}}>X</span>
            </li>
        </ClickableElement>
    )
}

SearchFilterBoxItem.propTypes = {
    filter: PropTypes.object.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    intl: intlShape.isRequired
}

export default injectIntl(SearchFilterBoxItem)
