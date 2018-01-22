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
const Schema = require('../lib/schema')
const GitBackend = require('../lib/backends/git')
const gitHelpers = require('./helpers/git')

ava.test.beforeEach((test) => {
  return gitHelpers.createTemporaryRepository('schema').tap((repositoryPath) => {
    test.context.backend = new GitBackend(repositoryPath)
    return test.context.backend.login()
  }).then((repositoryPath) => {
    return gitHelpers.commitFile(repositoryPath, 'schema.yaml', _.join([
      '- name: Title',
      '  type: Case Insensitive Text'
    ], '\n'))
  }).then(() => {
    test.context.schema = new Schema(test.context.backend)
  })
})

ava.test('should read and update a schema', (test) => {
  return test.context.schema.load('master').then((object) => {
    test.deepEqual(object, [
      {
        name: 'Title',
        type: 'Case Insensitive Text'
      }
    ])

    object.push({
      name: 'Description',
      type: 'Case Insensitive Text'
    })

    return test.context.schema.update('master', object)
  }).then(() => {
    return test.context.schema.load('master')
  }).then((object) => {
    test.deepEqual(object, [
      {
        name: 'Title',
        type: 'Case Insensitive Text'
      },
      {
        name: 'Description',
        type: 'Case Insensitive Text'
      }
    ])
  })
})

ava.test('should throw if we try to delete an element', (test) => {
  return test.throws(test.context.schema.deleteElement('master', 'foo'), 'File schema.yaml doesn\'t contain elements')
})
