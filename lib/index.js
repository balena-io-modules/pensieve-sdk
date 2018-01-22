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

/**
 * @module pensieve
 */

const GitHubBackend = require('./backends/github')
const GitBackend = require('./backends/git')
const Document = require('./document')
const Views = require('./views')
const Schema = require('./schema')

exports.Pensieve = class Pensieve {
  /**
   * @summary Create a Pensieve instance
   * @class
   * @public
   *
   * @param {Object} repository - repository
   * @param {String} repository.reference - git reference
   * @param {String} [repository.owner] - GitHub repository owner
   * @param {String} [repository.name] - GitHub repository name
   * @param {Object} [repository.credentials] - GitHub repository credentials
   * @param {String} [repository.credentials.username] - GitHub username
   * @param {String} [repository.credentials.password] - GitHub password
   * @param {String} [repository.credentials.token] - GitHub token
   * @param {String} [repository.path] - git repository path
   * @param {String} document - document name
   * @param {String} contentPath - document content path
   * @param {String} [backend='github'] - Pensieve backend (for advanced usage)
   *
   * @example
   * const pensieve = new Pensieve({
   *   reference: 'master',
   *   owner: 'resin-io',
   *   name: 'pensieve',
   *   credentials: {
   *     token: '.........'
   *   }
   * }, 'mydocument', 'Document')
   *
   * @example
   * const pensieve = new Pensieve({
   *   reference: 'master',
   *   owner: 'resin-io',
   *   name: 'pensieve',
   *   credentials: {
   *     username: 'myuser',
   *     password: 'secret'
   *   }
   * }, 'mydocument', 'Document')
   */
  constructor (repository, document, contentPath, backend = 'github') {
    this.reference = repository.reference

    if (backend === 'github') {
      this.backend = new GitHubBackend(
        repository.owner,
        repository.name,
        repository.credentials)
    } else if (backend === 'git') {
      this.backend = new GitBackend(repository.path)
    } else {
      throw new Error(`Unsupported backend: ${backend}`)
    }

    this.document = new Document(this.backend, document, contentPath)
    this.views = new Views(this.backend)
    this.schema = new Schema(this.backend)
  }

  /**
   * @summary Ensure the instance is ready to be used
   * @function
   * @public
   *
   * @fulfil {Object} - user profile
   * @returns {Promise}
   *
   * @example
   * const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
   * pensieve.ready().then((profile) => {
   *   console.log(profile)
   *   console.log('The instance is ready to be used')
   * })
   */
  ready () {
    return this.backend.login()
  }

  /**
   * @summary Get all fragments from the document
   * @function
   * @public
   *
   * @fulfil {Object[]} - document fragments
   * @returns {Promise}
   *
   * @example
   * const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
   * pensieve.getFragments().each((fragment) => {
   *   console.log(fragment)
   * })
   */
  getFragments () {
    return this.ready().then(() => {
      return this.document.load(this.reference)
    })
  }

  /**
   * @summary Update a document fragment
   * @function
   * @public
   *
   * @param {Object} fragment - fragment
   * @returns {Promise}
   *
   * @example
   * const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
   * pensieve.updateFragment({
   *   foo: 'bar',
   *   bar: 'baz',
   *   PS_UUID: '...'
   * }).then(() => {
   *   console.log('Done!')
   * })
   */
  updateFragment (fragment) {
    return this.ready().then(() => {
      return this.document.update(this.reference, [ fragment ])
    })
  }

  /**
   * @summary Delete a document fragment
   * @function
   * @public
   *
   * @param {String} uuid - fragment uuid
   * @returns {Promise}
   *
   * @example
   * const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
   * pensieve.deleteFragment('...').then(() => {
   *   console.log('Done!')
   * })
   */
  deleteFragment (uuid) {
    return this.ready().then(() => {
      return this.document.deleteElement(this.reference, uuid)
    })
  }

  /**
   * @summary Get all views
   * @function
   * @public
   *
   * @fulfil {Object[]} - views
   * @returns {Promise}
   *
   * @example
   * const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
   * pensieve.getViews().each((view) => {
   *   console.log(view)
   * })
   */
  getViews () {
    return this.ready().then(() => {
      return this.views.load(this.reference)
    })
  }

  /**
   * @summary Update a view
   * @function
   * @public
   *
   * @param {Object} view - view
   * @returns {Promise}
   *
   * @example
   * const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
   * pensieve.updateView({
   *   key: 'bar',
   *   scopeLabel: 'everyone',
   *   title: 'Bar',
   *   data: [ ... ]
   * }).then(() => {
   *   console.log('Done!')
   * })
   */
  updateView (view) {
    return this.ready().then(() => {
      return this.views.update(this.reference, [ view ])
    })
  }

  /**
   * @summary Delete a view
   * @function
   * @public
   *
   * @param {String} key - view key
   * @returns {Promise}
   *
   * @example
   * const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
   * pensieve.deleteView('MyView').then(() => {
   *   console.log('Done!')
   * })
   */
  deleteView (key) {
    return this.ready().then(() => {
      return this.views.deleteElement(this.reference, key)
    })
  }

  /**
   * @summary Get the schema
   * @function
   * @public
   *
   * @fulfil {Object} - schema
   * @returns {Promise}
   *
   * @example
   * const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
   * pensieve.getSchema().each((schema) => {
   *   console.log(schema)
   * })
   */
  getSchema () {
    return this.ready().then(() => {
      return this.schema.load(this.reference)
    })
  }

  /**
   * @summary Update the schema
   * @function
   * @public
   *
   * @param {Object} schema - schema
   * @returns {Promise}
   *
   * @example
   * const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
   * pensieve.updateSchema([ { ... } ]).then(() => {
   *   console.log('Done!')
   * })
   */
  updateSchema (schema) {
    return this.ready().then(() => {
      return this.schema.update(this.reference, schema)
    })
  }
}
