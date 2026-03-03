# End-to-end tests

The system is covered by end-to-end (e2e) tests where an automated browser instance interacts with the user interface and asserts changes based on those interactions.
The browser automation is facilitated by [playwright](https://playwright.dev/).

While running the e2e tests, we also collect backend and frontend code coverage.
On the frontend, the browser code is instrumented using [istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) and the code is then collected using a playwright [fixture](https://playwright.dev/docs/test-fixtures) by the npm package [playwright-test-coverage](https://www.npmjs.com/package/playwright-test-coverage).

On the backend, there is no need to instrument the code as Node.js has coverage collection built-in.
The npm package [c8](https://www.npmjs.com/package/c8) is the equivalent of istanbul's CLI [nyc](https://www.npmjs.com/package/nyc) which supports Node.js and ES6 modules.

## Requirements

1. All tests within a test file should run in sequence.
2. Each test file should run on a new / clean database state.
3. Test files can be run in parallel (Playwright uses [worker processes](https://playwright.dev/docs/test-parallel) to do this).
4. We can run tests as authenticated users.

Requirement (1) is Playwright's default behavior:
> Playwright Test runs tests in parallel. In order to achieve that, it runs several worker processes that run at the same time.
> By default, test files are run in parallel.
> Tests in a single file are run in order, in the same worker process.
> [Playwright Docs](https://playwright.dev/docs/test-parallel#introduction)


For (2) we need to reset the database before the execution of a test file starts.
To this end, we leverage automatic fixtures.
In particular we introduce a worker-scoped fixture (`_setLastTestFileName`) storing the name of the last executed test file name and a test-scoped fixture (`_databaseSeed`) that checks the last executed test file name against the current one.
If they match, the fixture does not do anything.
If they do not, the fixture resets the database to the initial state.

For (3) we need each worker to operate on their own database.
Because of this, we also need a different backend instance per worker (each backend instance communicates with a single database).
We can avoid recompiling the frontend for each different backend instance (the backend URL is a compilation option) by compiling it once using a relative URL.
However, with the relative URL we still need a separate frontend process per worker where `/api` and websocket requests are forwarded to the respective backend instance and all other requests are served by the frontend compilation output directory.
Summarized, each worker creates their own database and starts their own backend and frontend processes.
After finishing the processes are stopped and the database is deleted.
All of this is facilitated by the worker-scoped fixture `workerConfig`.

Finally, for (4) we add two setup [playwright projects](https://playwright.dev/docs/test-projects): `setup:authentication` and `setup:finish` where the latter depends on the former and all other projects depend on the latter.

Dependencies between playwright projects result in sequential execution.
Hence, `setup:authentication` is executed first, `setup:finish` second and then the remaining projects are executed, potentially in parallel.

Before playwright executes any tests, the command in `webServer` is run and it pauses execution until a webserver at the configured URL is accessible.
The configured command seeds the test database configured in `.env.test` (e.g. `collimator-tests`) with the e2e seeding config, starts a mock OpenId Connect server as well as a backend instance (the command assumes the backend was already built which is done by the `test:pre` script in `package.json`).
Finally, the command builds the frontend and starts a frontend instance.

As soon as the frontend becomes accessible, playwright will start executing the `setup:authentication` project.
This project authenticates the user with the help of the mock OpenId Connect server and stores the session storage in a file as recommended in the [playwright docs](https://playwright.dev/docs/auth).

After the project finishes, the `setup:finish` project stops the running backend, frontend and mock OpenId Connect server instances.
Once this is done, the process described above starts: Each worker creating their own database (**based on the __original__ database state after the `setup:finish` project**), starting their own backend and frontend instances and running their tests.
When a worker resets the database between different test files, the database is deleted and a new copy based on the __original__ one is created.

With this, the stored session storage information is valid in all worker databases and tests can restore this session storage information to execute tests as authenticated users.
