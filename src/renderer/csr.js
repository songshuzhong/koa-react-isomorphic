import React from 'react';
import {hydrate} from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import Loadable from 'react-loadable';

import App from '../client/index';

const clientSideRender = (modules = []) =>
    Loadable.preloadReady().then(() => {
        hydrate(
            <Loadable.Capture report={moduleName => modules.push(moduleName)}>
                <BrowserRouter>
                    <App initialState={__INITIAL_STATE__}/>
                </BrowserRouter>
            </Loadable.Capture>,
            document.getElementById('root'),
            () => document.body.removeChild(document.body.lastElementChild)
        );
    });

export default clientSideRender;
