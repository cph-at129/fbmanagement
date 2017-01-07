# Facebook Management (fbmanagement) application with Angular 2

> Live Example: [fbmanagement.site](http://www.fbmanagement.site/#/login)

> An Angular 2 application build with [Angular 2](https://angular.io) ( [Router](https://angular.io/docs/js/latest/api/router/),
[Forms](https://angular.io/docs/js/latest/api/forms/),
[Http](https://angular.io/docs/js/latest/api/http/),
[Tests](https://angular.io/docs/js/latest/api/test/),
[E2E](https://angular.github.io/protractor/),
[Webpack 2](http://webpack.github.io/) )

> Fbmangement provides an easy way to review your facebook account including your personal posts and feed, your business account with all campaigns, ad sets and ads
> The application gives you a user friendly interface, an instant synchronization with
the latest data from facebook API, useful features such as sorting and
filtering of different statistical data, graphical visualization of the data and others.


### Quick start
**Make sure you have Node version >= 6.0 and NPM >= 3**

```bash
# clone the repository

# go inside the project directory
cd fbmanagement-angular

# install the node dependencies
npm install

# start the application
npm start
```

go to [http://localhost:3000](http://localhost:3000) in your browser

## File Structure

```
fbmanagement/
 ├──config/                    * our configuration
 |   ├──html-elements-plugin   * plugin used by webpack
 |   |    ├──index.js
 |   ├──modules                * module replacement configuration
 |   |    ├──angular2-hmr-prod.js
 |   ├──helpers.js             * helper functions for our configuration files
 |   ├──karma.conf.js          * karma config for our unit tests
 |   ├──karma-test-shim.js     * tells Karma what files to pre-load and primes the Angular test framework with test versions of the providers
 │   ├──webpack.dev.js         * our development webpack config
 │   ├──webpack.prod.js        * our production webpack config
 │   └──webpack.test.js        * our testing webpack config
 │
 ├──css/                       * CSS, font awesome and project images
 ├──src/                       * our source files that will be compiled to javascript
 |   ├──common/                * common components and views used by the application
 |   ├──login/                 * login view component
 |   ├──doLogin/               * login helper file
 |   ├──home/                  * home view component
 |   ├──metrics/               * metrics components, views and services
 |   |  ├──metrics-charts/     * charts components on the statistical data
 |   |  ├──metrics-details/    * components and views for facebook ad account data
 |   |  ├──index.ts            * exports the metrics components and views
 |   |  ├──metrics.service.ts  * provides service functions for the metrics components
 |   ├──posts/                 * facebook account posts components and views
 |   |
 |   ├──app.component.ts       * main app component
 |   ├──app.component.html     * app component view
 |   ├──app.component.spec.ts  * tests for the app component
 |   ├──app.e2e.ts             * end to end tests for the app component
 |   ├──app.module.ts          * root module file
 |   ├──app.routes.ts          * routing configuration file
 |   ├──index.ts               * entry point of the application
 |   ├──jwt.service.ts         * JSON Web Token service file
 |   ├──polyfills.ts           * polyfills
 │   └──vendor.ts              * importing vendors
 │
 ├──testing/                   * additional testing configs
 ├──index.html                 * index page view
 ├──tslint.json                * typescript lint config
 ├──typedoc.json               * typescript documentation generator
 ├──tsconfig.json              * config that webpack uses for typescript
 ├──typings.json               * typescript compiler configuration file
 ├──package.json               * what npm uses to manage it's dependencies
 ├──karma.conf.js              * loads the karma configuration file
 ├──protractor.conf.js         * protractor config for our end-to-end tests
 └──webpack.config.js          * webpack main configuration file
```
