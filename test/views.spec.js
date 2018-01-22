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
const Views = require('../lib/views')
const GitBackend = require('../lib/backends/git')
const gitHelpers = require('./helpers/git')

ava.test.beforeEach((test) => {
  return gitHelpers.createTemporaryRepository('views').tap((repositoryPath) => {
    test.context.backend = new GitBackend(repositoryPath)
    return test.context.backend.login()
  }).then((repositoryPath) => {
    return gitHelpers.commitFile(repositoryPath, 'views.yaml', _.join([
      '- key: special',
      '  scopeLabel: just me',
      '  title: Special',
      '  data: []',
      '- key: global',
      '  scopeLabel: everyone',
      '  title: Global',
      '  data: []'
    ], '\n'))
  }).then(() => {
    test.context.views = new Views(test.context.backend)
  })
})

ava.test('should read a set of views and completely update the file', (test) => {
  return test.context.views.load('master').then((object) => {
    test.deepEqual(object, [
      {
        key: 'special',
        scopeLabel: 'just me',
        title: 'Special',
        data: []
      },
      {
        key: 'global',
        scopeLabel: 'everyone',
        title: 'Global',
        data: []
      }
    ])

    object[0].title = 'Updated Title'

    return test.context.views.update('master', object)
  }).then(() => {
    return test.context.views.load('master')
  }).then((object) => {
    test.deepEqual(object, [
      {
        key: 'special',
        scopeLabel: 'just me',
        title: 'Updated Title',
        data: []
      },
      {
        key: 'global',
        scopeLabel: 'everyone',
        title: 'Global',
        data: []
      }
    ])
  })
})

ava.test('should read a set of views and update a single one', (test) => {
  return test.context.views.load('master').then((object) => {
    test.deepEqual(object, [
      {
        key: 'special',
        scopeLabel: 'just me',
        title: 'Special',
        data: []
      },
      {
        key: 'global',
        scopeLabel: 'everyone',
        title: 'Global',
        data: []
      }
    ])

    return test.context.views.update('master', [
      {
        key: 'special',
        scopeLabel: 'just me',
        title: 'Updated Title',
        data: []
      }
    ])
  }).then(() => {
    return test.context.views.load('master')
  }).then((object) => {
    test.deepEqual(object, [
      {
        key: 'special',
        scopeLabel: 'just me',
        title: 'Updated Title',
        data: []
      },
      {
        key: 'global',
        scopeLabel: 'everyone',
        title: 'Global',
        data: []
      }
    ])
  })
})

ava.test('should read a set of views and add a new view', (test) => {
  return test.context.views.load('master').then((object) => {
    test.deepEqual(object, [
      {
        key: 'special',
        scopeLabel: 'just me',
        title: 'Special',
        data: []
      },
      {
        key: 'global',
        scopeLabel: 'everyone',
        title: 'Global',
        data: []
      }
    ])

    object.push({
      key: 'new',
      scopeLabel: 'just me',
      title: 'New',
      data: []
    })

    return test.context.views.update('master', object)
  }).then(() => {
    return test.context.views.load('master')
  }).then((object) => {
    test.deepEqual(object, [
      {
        key: 'special',
        scopeLabel: 'just me',
        title: 'Special',
        data: []
      },
      {
        key: 'global',
        scopeLabel: 'everyone',
        title: 'Global',
        data: []
      },
      {
        key: 'new',
        scopeLabel: 'just me',
        title: 'New',
        data: []
      }
    ])
  })
})

ava.test('should read a set of views and delete one view', (test) => {
  return test.context.views.load('master').then((object) => {
    test.deepEqual(object, [
      {
        key: 'special',
        scopeLabel: 'just me',
        title: 'Special',
        data: []
      },
      {
        key: 'global',
        scopeLabel: 'everyone',
        title: 'Global',
        data: []
      }
    ])

    return test.context.views.deleteElement('master', 'global')
  }).then(() => {
    return test.context.views.load('master')
  }).then((object) => {
    test.deepEqual(object, [
      {
        key: 'special',
        scopeLabel: 'just me',
        title: 'Special',
        data: []
      }
    ])
  })
})
