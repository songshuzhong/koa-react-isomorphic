/**
 *@author sshuzhong
 *@mailTo <a href="mailto:songshuzhong@bonc.com.cn">Song ShuZhong</a>
 *@Date 2017/9/25$ 17:57$
 *@desc
 */
import Webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import { PassThrough } from 'stream';
import compose from 'koa-compose';
import root from 'app-root-path';
import * as path from 'path';

function koaDevware (dev, compiler) {

    function waitMiddleware () {
        return new Promise((resolve, reject) => {
            dev.waitUntilValid(() => {
                resolve(true);
            });

            compiler.plugin('failed', (error) => {
                reject(error);
            });
        });
    }

    return async (context, next) => {
        await waitMiddleware();
        await new Promise((resolve, reject) => {
            dev(context.req, {
                end: (content) => {
                    context.body = content;
                    resolve();
                },
                setHeader: context.set.bind(context),
                locals: context.state
            }, () => resolve(next()));
        });
    };
}

function koaHotware (hot, compiler) {

    return async (context, next) => {
        let stream = new PassThrough();

        await hot(context.req, {
            write: stream.write.bind(stream),
            writeHead: (status, headers) => {
                context.body = stream;
                context.status = status;
                context.set(headers);
            }
        }, next);
    };
}

const koaWebpack = (options) => {

    const defaults = { dev: {}, hot: {} };

    options = Object.assign(defaults, options);

    let config = options.config,
        compiler = options.compiler;

    if (!compiler) {
        if (!config) {
            config = require(path.join(root.path, 'webpack.config.js'));
        }

        compiler = Webpack(config);
    }

    if (!options.dev.publicPath) {
        let publicPath = compiler.options.output.publicPath;

        if (!publicPath) {
            throw new Error('koa-webpack: publicPath must be set on `dev` options, or in a compiler\'s `output` configuration.');
        }

        options.dev.publicPath = publicPath;
    }

    const dev = devMiddleware(compiler, options.dev);
    const hot = hotMiddleware(compiler, options.hot);

    const middleware = compose([
        koaDevware(dev, compiler),
        koaHotware(hot, compiler)
    ]);

    return Object.assign(middleware, { dev, hot });
};

module.exports = koaWebpack;
