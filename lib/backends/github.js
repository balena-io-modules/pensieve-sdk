/*
 * Copyright 2018 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const GitHub = require('github-api')
const Bluebird = require('bluebird')
const Base64 = require('js-base64').Base64

// TODO: This is starting to get really similar to
// scrutinizer's GitHub backend. Find a way to reuse.

module.exports = class GitHubBackend {
  /**
   * @summary The GitHub Pensieve backend
   * @class
   * @public
   *
   * @description
   * You may authenticate with either username and password,
   * or with a personal access token.
   *
   * Make sure you call `.login()` before using any of the other
   * methods.
   *
   * @param {String} account - GitHub account
   * @param {String} repository - GitHub repository name
   * @param {Object} credentials - credentials
   * @param {String} [credentials.username] - GitHub username
   * @param {String} [credentials.password] - GitHub password
   * @param {String} [credentials.token] - GitHub token
   *
   * @example
   * const backend = new GitHubBackend('resin-io', 'scratchpad', {
   *   username: 'foo',
   *   password: 'secret'
   * })
   *
   * @example
   * const backend = new GitHubBackend('resin-io', 'scratchpad', {
   *   token: process.env.GITHUB_TOKEN,
   * })
   */
  constructor (account, repository, credentials) {
    this.credentials = credentials
    this.account = account
    this.name = repository
    this.instance = null
    this.profile = null
  }

  /**
   * @summary Login to the GitHub API
   * @function
   * @public
   *
   * @description
   * Make sure you call this method before attempting
   * to use any of the other ones.
   *
   * @fulfil {Object} GitHub user profile
   * @returns {Promise}
   *
   * @example
   * const github = new GitHubBackend('resin-io', 'scratchpad', { ... })
   * github.login().then((profile) => {
   *   console.log(profile)
   * })
   */
  login () {
    if (this.instance && this.profile) {
      return Bluebird.resolve(this.profile)
    }

    const github = new GitHub(this.credentials)

    // TODO: Why do we call `.getUser()` here?
    // Is it to make sure authentication worked?
    return Bluebird.resolve(github.getUser().getProfile())
      .get('data')
      .then((profile) => {
        this.instance = github
        this.repository = this.instance.getRepo(this.account, this.name)
        this.profile = profile
        return this.profile
      })
  }

  /**
   * @summary Get information about a branch
   * @function
   * @public
   *
   * @param {String} reference - git reference
   * @fulfil {Object} - branch object
   * @returns {Promise}
   *
   * @example
   * const github = new GitHubBackend('resin-io', 'scratchpad', { ... })
   * github.login().then(() => {
   *   github.getBranch('master').then((branch) => {
   *     console.log(branch.name)
   *     console.log(branch.hash)
   *   })
   * })
   */
  getBranch (reference) {
    return Bluebird.resolve(this.repository.getBranch(reference))
      .get('data')
      .then((branch) => {
        return {
          name: branch.name,
          hash: branch.commit.sha
        }
      })
  }

  /**
   * @summary Get the contents of a file
   * @function
   * @public
   *
   * @param {String} reference - git reference
   * @param {String} filePath - file path
   * @fulfil {String} - file contents
   * @returns {Promise}
   *
   * @example
   * const github = new GitHubBackend('resin-io', 'scratchpad', { ... })
   * github.login().then(() => {
   *   github.getFile('master', 'schema.yaml').then((contents) => {
   *     console.log(contents)
   *   })
   * })
   */
  getFile (reference, filePath) {
    return Bluebird.resolve(this.repository.getContents(reference, filePath))
      .get('data')
      .get('content')
      .then(Base64.decode)
  }

  /**
   * @summary Get the commit hash of a git reference
   * @function
   * @public
   *
   * @param {String} reference - git reference
   * @fulfil {String} - commit hash
   * @returns {Promise}
   *
   * @example
   * const github = new GitHubBackend('resin-io', 'scratchpad', { ... })
   * github.login().then(() => {
   *   github.getCommit('master').then((hash) => {
   *     console.log(hash)
   *   })
   * })
   */
  getCommit (reference) {
    return this.getBranch(reference).get('hash')
  }

  /**
   * @summary Commit a file change to GitHub
   * @function
   * @public
   *
   * @param {String} reference - git reference
   * @param {Object} options - options
   * @param {String} options.path - file to change
   * @param {String} options.content - new file contents
   * @param {String} options.message - commit message
   * @returns {Promise}
   *
   * @example
   * const github = new GitHubBackend('resin-io', 'scratchpad', { ... })
   * github.login().then(() => {
   *   github.commit('master', {
   *     path: 'schema.yaml',
   *     content: '...',
   *     message: 'Update schema.yaml'
   *   })
   * })
   */
  commit (reference, options) {
    // TODO: Ensure we return the new commit hash
    return Bluebird.resolve(this.repository.writeFile(reference,
      options.path,
      options.content,
      options.message, {
        encode: true
      }))
  }
}
