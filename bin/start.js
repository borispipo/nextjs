const chalk = require('chalk')
const chokidar = require('chokidar')
const program = require('commander')
const express = require('express')
const spawn = require('child_process').spawn
const next = require('next')
const path = require('path')
const fs = require("fs");
// TODO: parse is deprecated in favour of new URL api
// eslint-disable-next-line node/no-deprecated-api
const { parse } = require('url')

const cwd = process.cwd();
const pkg = fs.existsSync(path.resolve(cwd,"package.json")) ? require(`${path.resolve(cwd,"package.json")}`) : null;

const defaultWatchEvent = 'change'
if(pkg.version){
  program.version(pkg.version)
}
program
  .name("start")
  .description("start @fto-consult/nextjs application")
  .option('-r, --root [dir]', 'root directory of your nextjs app')
  .option(
    '-s, --script [path]',
    'path to the script you want to trigger on a watcher event',
    false
  )
  .option('-c, --command [cmd]', 'command to execute on a watcher event', false)
  .option(
    '-e, --event [name]',
    `name of event to watch, defaults to ${defaultWatchEvent}`,
    defaultWatchEvent
  )
  .option(
    '-p, --polling [name]',
    `use polling for the watcher, defaults to false`,
    false
  )
  .parse(process.argv)

const shell = process.env.SHELL
const port = parseInt(process.env.PORT, 10) || 3000
const hostname = process.env.HOSTNAME || 'localhost';;
const app = next({
  dev: true,
  dir: program.root || process.cwd(),
  // When using middlewares in NextJS 12, `hostname` and `port` must be provided
  // (https://nextjs.org/docs/advanced-features/custom-server)
  port,
  hostname,
});
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // if directories are provided, watch them for changes and trigger reload
  if (program.args.length > 0) {
    chokidar
      .watch(program.args, { usePolling: Boolean(program.polling) })
      .on(
        program.event,
        async (filePathContext, eventContext = defaultWatchEvent) => {
          app.server.hotReloader.send('building')

          if (program.command) {
            // Use spawn here so that we can pipe stdio from the command without buffering
            spawn(
              shell,
              [
                '-c',
                program.command
                  .replace(/\{event\}/gi, filePathContext)
                  .replace(/\{path\}/gi, eventContext),
              ],
              {
                stdio: 'inherit',
              }
            )
          }

          if (program.script) {
            try {
              // find the path of your --script script
              const scriptPath = path.join(
                process.cwd(),
                program.script.toString()
              )

              // require your --script script
              const executeFile = require(scriptPath)

              // run the exported function from your --script script
              executeFile(filePathContext, eventContext)
            } catch (e) {
              console.error('Remote script failed')
              console.error(e)
              return e
            }
          }

          app.server.hotReloader.send('reloadPage')
        }
      )
  }

  // create an express server
  const server = express()

  // special handling for mdx reload route
  const reloadRoute = express.Router()
  reloadRoute.use(express.json())
  reloadRoute.all('/', (req, res) => {
    // log message if present
    const msg = req.body.message
    const color = req.body.color
    msg && console.log(color ? chalk[color](msg) : msg)

    // reload the nextjs app
    app.server.hotReloader.send('building')
    app.server.hotReloader.send('reloadPage')
    res.end('Reload initiated')
  })

  server.use('/__next_reload', reloadRoute)

  // handle all other routes with next.js
  server.all('*', (req, res) => handle(req, res, parse(req.url, true)))

  // fire it up
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})