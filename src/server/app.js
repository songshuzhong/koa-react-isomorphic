require('babel-polyfill');
require('../utils/ignore')();
require('babel-register')({
    presets: ['env', 'react', 'stage-0'],
    plugins: ['react-loadable/babel', 'syntax-dynamic-import', 'dynamic-import-node']
});
const Koa = require('koa');
const path = require('path');
const staticCache = require('koa-static-cache');
const Loadable = require('react-loadable');

const createApp = require('../middleware/koa-react-engine').default;

const app = new Koa();

app.use(staticCache(path.resolve(__dirname, '../../dist'), {
    maxAge: 365 * 24 * 60 * 60,
    gzip: true
}));

app.use(createApp);

Loadable.preloadAll().then(() => {
    console.log('the server is running on 3000!');
    app.listen(3000);
});

