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

const File = require('./file')

module.exports = class Views extends File {
  /**
   * @summary Pensieve Views
   * @class
   * @public
   *
   * @param {Object} backend - Pensieve backend
   *
   * @example
   * const backend = new GitHubBackend('resin-io', 'scratchpad', {
   *   username: 'foo',
   *   password: 'secret'
   * })
   *
   * backend.login().then(() => {
   *   const views = new Views(backend)
   * })
   */
  constructor (backend) {
    super({
      backend,
      filePath: 'views.yaml',
      commitMessage: 'Edit views using Pensieve',
      idProperty: 'key'
    })
  }
}
