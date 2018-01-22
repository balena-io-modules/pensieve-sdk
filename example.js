const GitHubBackend = require('./lib/backends/github')
const GitBackend = require('./lib/backends/git')

// const backend = new GitHubBackend('resin-io', 'etcher', {
  // token: process.env.GITHUB_TOKEN
// })

const backend = new GitBackend(process.cwd())

backend.login().then((profile) => {
  return backend.getFile('master', 'package.json')
}).then((result) => {
  console.log(result)
})
