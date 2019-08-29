import fs from 'fs';
import path from 'path';
import React from 'react';
import Helmet from 'react-helmet';
import {matchPath} from 'react-router-dom';
import {getBundles} from 'react-loadable/webpack';
import fetch from 'isomorphic-fetch';

import serverSideRender from '../../renderer/ssr';
import state from '../../../dist/react-loadable';
import routes from '../../client/routers';

const preparedHTML = (data, {head, initialState, rootString, scripts, styles}) => {
    data = data.replace('<head>', `<head>${ head }\n${ styles }`);
    data = data.replace('<div id="root"></div>', `<div id="root">${ rootString }</div>`);
    data = data.replace('</body>', `${ scripts.join('\n') }\n</body>`);

    return data;
};

const createTags = (modules, initialState) => {
    let bundles = getBundles(state, modules);
    let styleFiles = bundles.filter(bundle => bundle.file.endsWith('.css'));
    let scriptFiles = bundles.filter(bundle => bundle.file.endsWith('.js'));
    let styles = styleFiles.map(style => `<link rel='stylesheet' href='/${ style.file }'>`).join('\n');
    let scripts = scriptFiles.map(script => `<script type='text/javascript' src='/${ script.file }'></script>`);

    scripts.push(`<script type='text/javascript'>window.__INITIAL_STATE__=${ JSON.stringify(initialState) }</script>`);
    return {styles, scripts};
};

const createInitialState = async () => fetch('https://easy-mock.com/mock/5d4a708b81e1396015e7c6c2/haokan/videolist').then(res => res.json());

const makeup = async (ctx, html) => {
    let modules = [];
    let initialState = await createInitialState();
    let rootString = serverSideRender(ctx, modules, initialState);
    let {styles, scripts} = createTags(modules, initialState);
    let helmet = Helmet.renderStatic();

    return preparedHTML(html, {
        head: helmet.title.toString() + helmet.meta.toString() + helmet.link.toString(),
        initialState,
        rootString,
        scripts,
        styles
    });
};

const createEngine = async (ctx, next) => {
    let html;
    let isMatch = routes.some(route => matchPath(ctx.req.url, {path: route.path, exact: route.exact}));

    if (!html) {
        html = fs.readFileSync(path.join(path.resolve(__dirname, '../../../dist/'), 'index.html'), 'utf-8');
    }

    if (isMatch) {

        ctx.body = await makeup(ctx, html);
    }

    await next();
};

export default createEngine;
