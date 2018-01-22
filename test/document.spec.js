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
      '    PS_UUID: e4c47b80-fd37-11e7-b414-432a465a7e21',
      '  - Title: Bar',
      '    PS_UUID: 8a91a060-f7cf-11e7-b900-c7937c066a9c'
    ], '\n'))
  }).then(() => {
    test.context.document = new Document(
      test.context.backend,
      'document',
      'Document')
  })
})

ava.test('should read a document and completely update it', (test) => {
  return test.context.document.load('master').then((object) => {
    test.deepEqual(object, [
      {
        Title: 'Foo',
        PS_UUID: 'e4c47b80-fd37-11e7-b414-432a465a7e21'
      },
      {
        Title: 'Bar',
        PS_UUID: '8a91a060-f7cf-11e7-b900-c7937c066a9c'
      }
    ])

    object[1].Title = 'Baz'

    return test.context.document.update('master', object)
  }).then(() => {
    return test.context.document.load('master')
  }).then((object) => {
    test.deepEqual(object, [
      {
        Title: 'Foo',
        PS_UUID: 'e4c47b80-fd37-11e7-b414-432a465a7e21'
      },
      {
        Title: 'Baz',
        PS_UUID: '8a91a060-f7cf-11e7-b900-c7937c066a9c'
      }
    ])
  })
})

ava.test('should read a document and update a single fragment', (test) => {
  return test.context.document.load('master').then((object) => {
    test.deepEqual(object, [
      {
        Title: 'Foo',
        PS_UUID: 'e4c47b80-fd37-11e7-b414-432a465a7e21'
      },
      {
        Title: 'Bar',
        PS_UUID: '8a91a060-f7cf-11e7-b900-c7937c066a9c'
      }
    ])

    return test.context.document.update('master', [
      {
        Title: 'Baz',
        PS_UUID: '8a91a060-f7cf-11e7-b900-c7937c066a9c'
      }
    ])
  }).then(() => {
    return test.context.document.load('master')
  }).then((object) => {
    test.deepEqual(object, [
      {
        Title: 'Baz',
        PS_UUID: '8a91a060-f7cf-11e7-b900-c7937c066a9c'
      },
      {
        Title: 'Foo',
        PS_UUID: 'e4c47b80-fd37-11e7-b414-432a465a7e21'
      }
    ])
  })
})

ava.test('should read a document and add a new fragment', (test) => {
  return test.context.document.load('master').then((object) => {
    test.deepEqual(object, [
      {
        Title: 'Foo',
        PS_UUID: 'e4c47b80-fd37-11e7-b414-432a465a7e21'
      },
      {
        Title: 'Bar',
        PS_UUID: '8a91a060-f7cf-11e7-b900-c7937c066a9c'
      }
    ])

    return test.context.document.update('master', [
      {
        Title: 'Baz',
        PS_UUID: '9a3a9090-d424-11e7-98eb-673c41fe0ff0'
      }
    ])
  }).then(() => {
    return test.context.document.load('master')
  }).then((object) => {
    test.deepEqual(object, [
      {
        Title: 'Baz',
        PS_UUID: '9a3a9090-d424-11e7-98eb-673c41fe0ff0'
      },
      {
        Title: 'Foo',
        PS_UUID: 'e4c47b80-fd37-11e7-b414-432a465a7e21'
      },
      {
        Title: 'Bar',
        PS_UUID: '8a91a060-f7cf-11e7-b900-c7937c066a9c'
      }
    ])
  })
})

ava.test('should read a document and delete one fragment', (test) => {
  return test.context.document.load('master').then((object) => {
    test.deepEqual(object, [
      {
        Title: 'Foo',
        PS_UUID: 'e4c47b80-fd37-11e7-b414-432a465a7e21'
      },
      {
        Title: 'Bar',
        PS_UUID: '8a91a060-f7cf-11e7-b900-c7937c066a9c'
      }
    ])

    const id = object[1].PS_UUID
    return test.context.document.deleteElement('master', id)
  }).then(() => {
    return test.context.document.load('master')
  }).then((object) => {
    test.deepEqual(object, [
      {
        Title: 'Foo',
        PS_UUID: 'e4c47b80-fd37-11e7-b414-432a465a7e21'
      }
    ])
  })
})
