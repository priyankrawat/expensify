import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {propTypes as validateLinkPropTypes, defaultProps as validateLinkDefaultProps} from './validateLinkPropTypes';
import * as User from '../../libs/actions/User';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';
import Permissions from '../../libs/Permissions';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize from '../../components/withLocalize';
import CONST from '../../CONST';
import compose from '../../libs/compose';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

    /** The credentials of the person logging in */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,
    }),

    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,
};

const defaultProps = {
    route: validateLinkDefaultProps,
    betas: [],
    session: {
        authToken: null,
    },
    credentials: {},
    preferredLocale: CONST.LOCALES.DEFAULT,
};

class ValidateLoginPage extends Component {
    componentDidMount() {
        const login = lodashGet(this.props, 'credentials.login', null);
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');

        // A fresh session will not have credentials.login available and so also no user permission betas,
        // so we skip the permissions check in that case.
        if (!login || Permissions.canUsePasswordlessLogins(this.props.betas)) {
            if (lodashGet(this.props, 'session.authToken')) {
                // If already signed in, do not show the validate code if not on web,
                // because we don't want to block the user with the interstitial page.
                Navigation.goBack(false);
            } else {
                Session.signInWithValidateCodeAndNavigate(accountID, validateCode, null, this.props.preferredLocale);
            }
        } else {
            User.validateLogin(accountID, validateCode);
        }
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

ValidateLoginPage.propTypes = propTypes;
ValidateLoginPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        betas: {key: ONYXKEYS.BETAS},
        credentials: {key: ONYXKEYS.CREDENTIALS},
        session: {key: ONYXKEYS.SESSION},
    }),
)(ValidateLoginPage);
