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

const _ = require('lodash')
const Bluebird = require('bluebird')
const fs = Bluebird.promisifyAll(require('fs'))
const path = require('path')
const git = require('simple-git/promise')

/**
 * @summary Get last commit hash from reference
 * @function
 * @private
 *
 * @param {String} repository - repository path
 * @param {String} reference - git reference
 * @fulfil {String} - commit hash
 * @returns {Promise}
 *
 * @example
 * getLastCommitHashFromReference('./path/to/repo', 'master').then((hash) => {
 *   console.log(hash)
 * })
 */
const getLastCommitHashFromReference = (repository, reference) => {
  // See https://stackoverflow.com/a/15679298/1641422
  return Bluebird.resolve(git(repository).raw([
    'log',
    '-1',
    '--pretty=format:%H',
    reference,

    // Resolve ambiguity if reference is equal to an existing file
    // See https://stackoverflow.com/a/26349250/1641422
    '--'
  ]))
}

module.exports = class GitBackend {
  /**
   * @summary The git Pensieve backend
   * @class
   * @public
   *
   * @param {String} repository - git repository path
   *
   * @example
   * const backend = new GitBackend('./path/to/repo')
   */
  constructor (repository) {
    this.path = repository
  }

  /**
   * @summary Login to the git repository (noop)
   * @function
   * @public
   *
   * @fulfil {Object} user profile
   * @returns {Promise}
   *
   * @example
   * const git = new GitBackend('./path/to/repo')
   * git.login().then((profile) => {
   *   console.log(profile)
   * })
   */
  login () { // eslint-disable-line class-methods-use-this
    return Bluebird.resolve({})
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
   * const git = new GitBackend('./path/to/repo')
   * git.login().then(() => {
   *   git.getBranch('master').then((branch) => {
   *     console.log(branch.name)
   *     console.log(branch.hash)
   *   })
   * })
   */
  getBranch (reference) {
    // See https://stackoverflow.com/a/2707110/1641422
    return Bluebird.resolve(git(this.path).raw([
      'branch',
      '--contains',
      reference
    ])).then((result) => {
      const branchName = result.match(/^\*? ?(\w+)/i)[1]
      return Bluebird.props({
        name: Bluebird.resolve(branchName),
        hash: getLastCommitHashFromReference(this.path, branchName)
      })
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
   * const git = new GitBackend('./path/to/repo')
   * git.login().then(() => {
   *   git.getFile('master', 'schema.yaml').then((contents) => {
   *     console.log(contents)
   *   })
   * })
   */
  getFile (reference, filePath) {
    return Bluebird.resolve(git(this.path).raw([
      'show',
      `${reference}:${filePath}`
    ]))
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
   * const git = new GitBackend('./path/to/repo')
   * git.login().then(() => {
   *   git.getCommit('master').then((hash) => {
   *     console.log(hash)
   *   })
   * })
   */
  getCommit (reference) {
    return this.getBranch(reference).get('hash')
  }

  /**
   * @summary Commit a file change
   * @function
   * @public
   *
   * @param {String} reference - git reference
   * @param {Object} options - options
   * @param {String} options.path - file to change
   * @param {String} options.content - new file contents
   * @param {String} options.message - commit message
   * @fulfil {String} - commit hash
   * @returns {Promise}
   *
   * @example
   * const git = new GitBackend('./path/to/repo')
   * git.login().then(() => {
   *   git.commit('master', {
   *     path: 'schema.yaml',
   *     content: '...',
   *     message: 'Update schema.yaml'
   *   })
   * })
   */
  commit (reference, options) {
    const absolutePath = path.join(this.path, options.path)
    return fs.writeFileAsync(absolutePath, options.content).then(() => {
      const gitHandler = git(this.path)
      return gitHandler.branch().then((branches) => {
        if (_.includes(branches.all, reference)) {
          return gitHandler.checkout(reference)
        }

        return gitHandler.checkoutLocalBranch(reference)
      }).then(() => {
        return gitHandler.add(options.path)
      }).then(() => {
        return gitHandler.commit(options.message)
      }).then(() => {
        return getLastCommitHashFromReference(this.path, reference)
      })
    })
  }
}
