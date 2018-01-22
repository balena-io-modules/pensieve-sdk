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
const uuidv1 = require('uuid/v1')
const File = require('./file')

module.exports = class Document extends File {
  /**
   * @summary Pensieve Document
   * @class
   * @public
   *
   * @param {Object} backend - Pensieve backend
   * @param {String} name - document name
   * @param {String} contentPath - document content path
   *
   * @example
   * const backend = new GitHubBackend('resin-io', 'scratchpad', {
   *   username: 'foo',
   *   password: 'secret'
   * })
   *
   * backend.login().then(() => {
   *   const document = new Document(backend, 'mydocument', 'Data')
   * })
   */
  constructor (backend, name, contentPath) {
    super({
      backend,
      filePath: `${name}.yaml`,
      commitMessage: `Edit ${name} using Pensieve`,
      contentPath,
      idProperty: 'PS_UUID'
    })
  }

  /**
   * @summary Sanitize a fragment
   * @function
   * @private
   *
   * @param {Object} fragment - fragment
   * @returns {Object} sanitized fragment
   *
   * @example
   * const document = new Document({ ... }, 'mydocument', 'Data')
   * const fragment = document.sanitizeFragment({ ... })
   */
  sanitizeFragment (fragment) {
    if (!fragment[this.idProperty]) {
      fragment[this.idProperty] = uuidv1()
    }

    return fragment
  }

  /**
   * @summary Load the document file
   * @function
   * @private
   *
   * @param {String} reference - git reference
   * @fulfil {Object[]} - fragments
   * @returns {Promise}
   *
   * @example
   * const document = new Document({ ... }, 'mydocument', 'Data')
   * document.load('master').each((fragment) => {
   *   console.log(fragment)
   * })
   */
  load (reference) {
    return super.load(reference)
      .map(_.bind(this.sanitizeFragment, this))
  }

  /**
   * @summary Update the document
   * @function
   * @public
   *
   * @param {String} reference - git reference
   * @param {Object[]} fragments - document fragments
   * @returns {Promise}
   *
   * @example
   * const document = new Document({ ... }, 'mydocument', 'Data')
   * document.update('master', [ { ... } ]).then(() => {
   *   console.log('Done!')
   * })
   */
  update (reference, fragments) {
    return super.update(reference,
      _.map(fragments, _.bind(this.sanitizeFragment, this)))
  }
}
