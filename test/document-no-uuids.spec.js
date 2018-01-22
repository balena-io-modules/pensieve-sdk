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

const ava = require('ava')
const _ = require('lodash')
const Document = require('../lib/document')
const GitBackend = require('../lib/backends/git')
const gitHelpers = require('./helpers/git')

ava.test.beforeEach((test) => {
  return gitHelpers.createTemporaryRepository('document').tap((repositoryPath) => {
    test.context.backend = new GitBackend(repositoryPath)
    return test.context.backend.login()
  }).then((repositoryPath) => {
    return gitHelpers.commitFile(repositoryPath, 'document.yaml', _.join([
      'Document:',
      '  - Title: Foo',
      '  - Title: Bar'
    ], '\n'))
  }).then(() => {
    test.context.document = new Document(
      test.context.backend,
      'document',
      'Document')
  })
})

ava.test('should assign random uuids', (test) => {
  return test.context.document.load('master').then((object) => {
    test.is(typeof object[0].PS_UUID, 'string')
    test.is(typeof object[1].PS_UUID, 'string')
  })
})
