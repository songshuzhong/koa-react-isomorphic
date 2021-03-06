import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import PropTypes from 'prop-types';
import NProgress from 'nprogress';

import routes from './routers/index';
import NoMatch from './components/noMatch';

import 'nprogress/nprogress.css';

class Application extends Component {
    constructor(props) {
        super(props);
        this.state = this.props.initialState;
        this.currentUrl = '/';
    }

    componentDidMount() {
        this.context.router.history.listen(() => {
            let currentUrl = this.context.router.history.location.pathname;

            currentUrl !== this.currentUrl ? NProgress.start() : null;
        });
    }

    componentDidUpdate() {
        let currentUrl = this.context.router.history.location.pathname;

        NProgress.done();
        this.currentUrl = currentUrl;
    }

    render() {
        return (
            <Switch>
                {routes.map(route =>
                    <Route
                        key={route.path}
                        data={this.state}
                        exact={route.exact}
                        path={route.path}
                        render={props => <route.component {...props} initialState={this.state}/>}/>
                )}
                <Route component={NoMatch}/>
            </Switch>
        );
    }
}

Application.contextTypes = {
    router: PropTypes.shape({
        history: PropTypes.shape().isRequired
    }).isRequired
};

export default Application;
