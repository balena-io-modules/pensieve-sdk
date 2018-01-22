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
const GitBackend = require('../../lib/backends/git')
const gitHelpers = require('../helpers/git')

ava.test.beforeEach((test) => {
  return gitHelpers.createTemporaryRepository('git-backend').then((repositoryPath) => {
    test.context.backend = new GitBackend(repositoryPath)
    return test.context.backend.login()
  })
})

ava.test('should return an empty user profile', (test) => {
  return test.context.backend.login().then((profile) => {
    test.deepEqual(profile, {})
  })
})

ava.test('should commit a file to master', (test) => {
  return test.context.backend.commit('master', {
    path: 'TEST',
    content: 'Hello World',
    message: 'Edit TEST'
  }).then(() => {
    return test.context.backend.getFile('master', 'TEST')
  }).then((contents) => {
    test.is(contents, 'Hello World')
  })
})

ava.test('should commit a file to another branch', (test) => {
  return test.context.backend.commit('test', {
    path: 'TEST',
    content: 'Hello from test',
    message: 'Edit TEST'
  }).then(() => {
    // Just to ensure we're commiting to the right branch
    return test.context.backend.commit('master', {
      path: 'TEST',
      content: 'Hello from master',
      message: 'Edit TEST'
    })
  }).then(() => {
    return test.context.backend.getFile('test', 'TEST')
  }).then((contents) => {
    test.is(contents, 'Hello from test')
  })
})

ava.test('should get branch information out of a reference', (test) => {
  return test.context.backend.commit('test', {
    path: 'TEST',
    content: 'Hello World',
    message: 'Edit TEST'
  }).then((hash) => {
    return test.context.backend.getBranch(hash).then((branch) => {
      test.deepEqual(branch, {
        name: 'test',
        hash
      })
    })
  })
})

ava.test('should get branch information out of a branch', (test) => {
  return test.context.backend.commit('test', {
    path: 'TEST',
    content: 'Hello World',
    message: 'Edit TEST'
  }).then((hash) => {
    return test.context.backend.getBranch('test').then((branch) => {
      test.deepEqual(branch, {
        name: 'test',
        hash
      })
    })
  })
})

ava.test('should get the last commit of a branch', (test) => {
  return test.context.backend.commit('master', {
    path: 'TEST',
    content: 'Hello World',
    message: 'Edit TEST'
  }).then((hash) => {
    return test.context.backend.getCommit('master').then((branchHash) => {
      test.is(hash, branchHash)
    })
  })
})
