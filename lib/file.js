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
const path = require('path')
const jsyaml = require('js-yaml')

module.exports = class File {
  /**
   * @summary Pensieve File
   * @class
   * @public
   *
   * @description
   * Make sure the backend is properly initialized
   * before create an instance.
   *
   * @param {Object} options - options
   * @param {Object} options.backend - Pensieve backend
   * @param {String} options.filePath - file path
   * @param {String} options.commitMessage - commit message
   * @param {String[]} [options.contentPath] - content path
   * @param {String} [options.idProperty] - id property
   *
   * @example
   * const backend = new GitHubBackend('resin-io', 'scratchpad', {
   *   username: 'foo',
   *   password: 'secret'
   * })
   *
   * backend.login().then(() => {
   *   const file = new File({
   *     backend: backend,
   *     filePath: 'myfile.yaml',
   *     commitMessage: 'Update myfile.yaml'
   *   })
   * })
   */
  constructor (options) {
    this.backend = options.backend
    this.path = options.filePath
    this.extension = path.extname(this.path)
    this.commitMessage = options.commitMessage
    this.contentPath = options.contentPath
    this.idProperty = options.idProperty
  }

  /**
   * @summary Load the Pensieve file
   * @function
   * @private
   *
   * @param {String} reference - git reference
   * @fulfil {Object} - file
   * @returns {Promise}
   *
   * @example
   * const file = new File({ ... }, 'myfile.yaml')
   * file.load('master').then((object) => {
   *   console.log(object)
   * })
   */
  load (reference) {
    // TODO: We should cache this for performance reasons
    return this.backend.getFile(reference, this.path)
      .then(_.bind(this.decode, this)).then((object) => {
        if (!_.isEmpty(this.contentPath)) {
          return _.get(object, this.contentPath)
        }

        return object
      })
  }

  /**
   * @summary Reset the file
   * @function
   * @public
   *
   * @param {String} reference - git reference
   * @param {Object} contents - file contents
   * @returns {Promise}
   *
   * @example
   * const file = new File({ ... }, 'myfile.yaml')
   * file.load('master').then((object) => {
   *   // Make changes to object...
   *   return file.set('master', object)
   * })
   */
  set (reference, contents) {
    return Bluebird.try(() => {
      if (_.isEmpty(this.contentPath)) {
        return contents
      }

      const object = {}
      return _.set(object, this.contentPath, contents)
    }).then((data) => {
      return this.backend.commit(reference, {
        path: this.path,
        content: this.encode(data),
        message: this.commitMessage
      })
    })
  }

  /**
   * @summary Update the file
   * @function
   * @public
   *
   * @param {String} reference - git reference
   * @param {(Object|Object[])} contents - file contents
   * @returns {Promise}
   *
   * @example
   * const file = new File({ ... }, 'myfile.yaml')
   * file.set('master', { ... }).then(() => {
   *   console.log('Done!')
   * })
   */
  update (reference, contents) {
    return this.load(reference).then((source) => {
      if (_.isEmpty(this.idProperty)) {
        return _.merge(source, contents)
      }

      return _.unionBy(contents, source, this.idProperty)
    }).then((data) => {
      return this.set(reference, data)
    })
  }

  /**
   * @summary Delete an element from a file
   * @function
   * @public
   *
   * @param {String} reference - git reference
   * @param {Any} id - element id
   * @returns {Promise}
   *
   * @example
   * const file = new File({ ... }, 'myfile.yaml')
   * file.deleteElement('master', 'xxxxxxx').then(() => {
   *   console.log('Done!')
   * })
   */
  deleteElement (reference, id) {
    if (_.isEmpty(this.idProperty)) {
      return Bluebird.reject(new Error(`File ${this.path} doesn't contain elements`))
    }

    return this.load(reference).then((source) => {
      return _.reject(source, {
        [this.idProperty]: id
      })
    }).then((data) => {
      return this.set(reference, data)
    })
  }

  /**
   * @summary Decode a Pensieve file
   * @function
   * @protected
   *
   * @param {String} file - file
   * @returns {Object} decoded file
   *
   * @example
   * const file = new File({ ... }, 'myfile.yaml')
   * const object = file.decode('......')
   */
  decode (file) {
    if (this.extension !== '.yaml') {
      throw new Error(`${this.path} is not a valid file type`)
    }

    return jsyaml.load(file)
  }

  /**
   * @summary Encode a Pensieve file
   * @function
   * @protected
   *
   * @param {Object} file - file
   * @returns {String} encoded file
   *
   * @example
   * const file = new File({ ... }, 'myfile.yaml')
   * const string = file.encode({ ... })
   */
  encode (file) {
    if (this.extension !== '.yaml') {
      throw new Error(`${this.path} is not a valid file type`)
    }

    return jsyaml.safeDump(file, {
      // This can happen in the case of a simple text search
      skipInvalid: true
    })
  }
}
