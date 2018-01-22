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
const File = require('../lib/file')
const GitBackend = require('../lib/backends/git')
const gitHelpers = require('./helpers/git')

ava.test('should throw if the file format is not recognised when loading', (test) => {
  return gitHelpers.createTemporaryRepository('file').tap((repositoryPath) => {
    return gitHelpers.commitFile(repositoryPath, 'foo.ini', _.join([
      'foo=bar',
      'bar=baz'
    ], '\n'))
  }).then((repositoryPath) => {
    const backend = new GitBackend(repositoryPath)
    return backend.login().return(backend)
  }).then((backend) => {
    const file = new File({
      backend,
      filePath: 'foo.ini',
      commitMessage: 'Edit foo using Pensieve'
    })

    return test.throws(file.load('master'), 'foo.ini is not a valid file type')
  })
})

ava.test('should throw if the file format is not recognised when setting', (test) => {
  return gitHelpers.createTemporaryRepository('file').tap((repositoryPath) => {
    return gitHelpers.commitFile(repositoryPath, 'foo.ini', _.join([
      'foo=bar',
      'bar=baz'
    ], '\n'))
  }).then((repositoryPath) => {
    const backend = new GitBackend(repositoryPath)
    return backend.login().return(backend)
  }).then((backend) => {
    const file = new File({
      backend,
      filePath: 'foo.ini',
      commitMessage: 'Edit foo using Pensieve'
    })

    return test.throws(file.set('master', {
      foo: 'qux'
    }), 'foo.ini is not a valid file type')
  })
})
