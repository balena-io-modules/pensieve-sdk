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
const path = require('path')
const fs = require('fs')
const Pensieve = require('../lib/index').Pensieve
const GitBackend = require('../lib/backends/git')
const gitHelpers = require('./helpers/git')

const DOCUMENT = fs.readFileSync(path.join(__dirname, 'examples', 'pokedex', 'pokedex.yaml'), {
  encoding: 'utf8'
})

const SCHEMA = fs.readFileSync(path.join(__dirname, 'examples', 'pokedex', 'schema.yaml'), {
  encoding: 'utf8'
})

const VIEWS = fs.readFileSync(path.join(__dirname, 'examples', 'pokedex', 'views.yaml'), {
  encoding: 'utf8'
})

ava.test.beforeEach((test) => {
  return gitHelpers.createTemporaryRepository('pensieve').tap((repositoryPath) => {
    test.context.backend = new GitBackend(repositoryPath)
    return test.context.backend.login()
  }).tap((repositoryPath) => {
    return gitHelpers.commitFile(repositoryPath, 'pokedex.yaml', DOCUMENT)
  }).tap((repositoryPath) => {
    return gitHelpers.commitFile(repositoryPath, 'schema.yaml', SCHEMA)
  }).tap((repositoryPath) => {
    return gitHelpers.commitFile(repositoryPath, 'views.yaml', VIEWS)
  }).then((repositoryPath) => {
    test.context.pensieve = new Pensieve({
      path: repositoryPath,
      reference: 'master'
    }, 'pokedex', 'Pokedex', 'git')
  })
})

ava.test('.getFragments(): should get all fragments', (test) => {
  return test.context.pensieve.getFragments().then((fragments) => {
    test.deepEqual(fragments, [
      {
        title: 'Shelder',
        Caught: false,
        Height: 2,
        Weight: 3,
        Description: 'Lorem ipsum dolor sit amet',
        PS_UUID: 'ac9212c0-d688-11e7-aa16-0f429a0f090a'
      },
      {
        title: 'Charmander',
        Name: 'Charmander',
        Height: 0,
        Weight: 8.5,
        Description: 'Lorem ipsum dolor sit amet',
        Category: 'Lizard',
        Abilities: 'Blaze',
        'National Pokedex number': 4,
        Favourite: '#Yes',
        PS_UUID: 'e17b48c1-a9d9-11e7-b93c-0de164847969'
      }
    ])
  })
})

ava.test('.updateFragment(): should edit a field from a fragment', (test) => {
  return test.context.pensieve.updateFragment({
    title: 'Shelder',
    Caught: false,
    Height: 2,
    Weight: 3,
    Description: 'A new description',
    PS_UUID: 'ac9212c0-d688-11e7-aa16-0f429a0f090a'
  }).then(() => {
    return test.context.pensieve.getFragments()
  }).then((fragments) => {
    test.deepEqual(fragments, [
      {
        title: 'Shelder',
        Caught: false,
        Height: 2,
        Weight: 3,
        Description: 'A new description',
        PS_UUID: 'ac9212c0-d688-11e7-aa16-0f429a0f090a'
      },
      {
        title: 'Charmander',
        Name: 'Charmander',
        Height: 0,
        Weight: 8.5,
        Description: 'Lorem ipsum dolor sit amet',
        Category: 'Lizard',
        Abilities: 'Blaze',
        'National Pokedex number': 4,
        Favourite: '#Yes',
        PS_UUID: 'e17b48c1-a9d9-11e7-b93c-0de164847969'
      }
    ])
  })
})

ava.test('.updateFragment(): should delete a field from a fragment', (test) => {
  return test.context.pensieve.updateFragment({
    title: 'Shelder',
    Height: 2,
    Weight: 3,
    Description: 'Lorem ipsum dolor sit amet',
    PS_UUID: 'ac9212c0-d688-11e7-aa16-0f429a0f090a'
  }).then(() => {
    return test.context.pensieve.getFragments()
  }).then((fragments) => {
    test.deepEqual(fragments, [
      {
        title: 'Shelder',
        Height: 2,
        Weight: 3,
        Description: 'Lorem ipsum dolor sit amet',
        PS_UUID: 'ac9212c0-d688-11e7-aa16-0f429a0f090a'
      },
      {
        title: 'Charmander',
        Name: 'Charmander',
        Height: 0,
        Weight: 8.5,
        Description: 'Lorem ipsum dolor sit amet',
        Category: 'Lizard',
        Abilities: 'Blaze',
        'National Pokedex number': 4,
        Favourite: '#Yes',
        PS_UUID: 'e17b48c1-a9d9-11e7-b93c-0de164847969'
      }
    ])
  })
})

ava.test('.updateFragment(): should add a new fragment', (test) => {
  return test.context.pensieve.updateFragment({
    title: 'Wartortle',
    Height: 1,
    Weight: 22.5,
    Description: 'Lorem ipsum dolor sit amet',
    Category: 'Turtle',
    Abilities: 'Torrent',
    'National Pokedex number': 8
  }).then(() => {
    return test.context.pensieve.getFragments()
  }).then((fragments) => {
    test.is(fragments.length, 3)

    test.is(typeof fragments[0].PS_UUID, 'string')
    test.deepEqual(_.omit(fragments[0], [ 'PS_UUID' ]), {
      title: 'Wartortle',
      Height: 1,
      Weight: 22.5,
      Description: 'Lorem ipsum dolor sit amet',
      Category: 'Turtle',
      Abilities: 'Torrent',
      'National Pokedex number': 8
    })

    test.deepEqual(fragments[1], {
      title: 'Shelder',
      Caught: false,
      Height: 2,
      Weight: 3,
      Description: 'Lorem ipsum dolor sit amet',
      PS_UUID: 'ac9212c0-d688-11e7-aa16-0f429a0f090a'
    })

    test.deepEqual(fragments[2], {
      title: 'Charmander',
      Name: 'Charmander',
      Height: 0,
      Weight: 8.5,
      Description: 'Lorem ipsum dolor sit amet',
      Category: 'Lizard',
      Abilities: 'Blaze',
      'National Pokedex number': 4,
      Favourite: '#Yes',
      PS_UUID: 'e17b48c1-a9d9-11e7-b93c-0de164847969'
    })
  })
})

ava.test('.deleteFragment(): should delete a fragment', (test) => {
  return test.context.pensieve.deleteFragment('e17b48c1-a9d9-11e7-b93c-0de164847969').then(() => {
    return test.context.pensieve.getFragments()
  }).then((fragments) => {
    test.deepEqual(fragments, [
      {
        title: 'Shelder',
        Caught: false,
        Height: 2,
        Weight: 3,
        Description: 'Lorem ipsum dolor sit amet',
        PS_UUID: 'ac9212c0-d688-11e7-aa16-0f429a0f090a'
      }
    ])
  })
})

ava.test('.getFragments(): should get all views', (test) => {
  return test.context.pensieve.getViews().then((views) => {
    test.deepEqual(views, [
      {
        key: 'global',
        scopeLabel: 'everyone',
        title: 'Global',
        data: [
          {
            name: 'tester',
            rules: [
              {
                name: 'Full text search',
                value: 'char',
                id: 'l7lVKLmnllR8FeVn'
              }
            ],
            id: '22Go4zuVHCqJiQQ9',
            scopeKey: 'global'
          }
        ]
      },
      {
        key: 'TestUser',
        scopeLabel: 'just me',
        title: 'TestUser',
        data: [
          {
            name: 'macaroni',
            rules: [
              {
                name: 'Full text search',
                value: 'macaroni',
                id: 'G1M2z7kWhqrbo1fh'
              }
            ],
            id: 'H9BALQr2nwKpQ08o',
            scopeKey: 'LucianBuzzo'
          }
        ]
      }
    ])
  })
})

ava.test('.updateView(): should update a property from a view', (test) => {
  return test.context.pensieve.updateView({
    key: 'global',
    scopeLabel: 'everyone',
    title: 'Global',
    data: [
      {
        name: 'tester',
        rules: [
          {
            name: 'Full text search',
            value: 'hello',
            id: 'l7lVKLmnllR8FeVn'
          }
        ],
        id: '22Go4zuVHCqJiQQ9',
        scopeKey: 'global'
      }
    ]
  }).then(() => {
    return test.context.pensieve.getViews()
  }).then((views) => {
    test.deepEqual(views, [
      {
        key: 'global',
        scopeLabel: 'everyone',
        title: 'Global',
        data: [
          {
            name: 'tester',
            rules: [
              {
                name: 'Full text search',
                value: 'hello',
                id: 'l7lVKLmnllR8FeVn'
              }
            ],
            id: '22Go4zuVHCqJiQQ9',
            scopeKey: 'global'
          }
        ]
      },
      {
        key: 'TestUser',
        scopeLabel: 'just me',
        title: 'TestUser',
        data: [
          {
            name: 'macaroni',
            rules: [
              {
                name: 'Full text search',
                value: 'macaroni',
                id: 'G1M2z7kWhqrbo1fh'
              }
            ],
            id: 'H9BALQr2nwKpQ08o',
            scopeKey: 'LucianBuzzo'
          }
        ]
      }
    ])
  })
})

ava.test('.deleteView(): should delete a view', (test) => {
  return test.context.pensieve.deleteView('global').then(() => {
    return test.context.pensieve.getViews()
  }).then((views) => {
    test.deepEqual(views, [
      {
        key: 'TestUser',
        scopeLabel: 'just me',
        title: 'TestUser',
        data: [
          {
            name: 'macaroni',
            rules: [
              {
                name: 'Full text search',
                value: 'macaroni',
                id: 'G1M2z7kWhqrbo1fh'
              }
            ],
            id: 'H9BALQr2nwKpQ08o',
            scopeKey: 'LucianBuzzo'
          }
        ]
      }
    ])
  })
})

ava.test('.getSchema(): should get the schema', (test) => {
  return test.context.pensieve.getSchema().then((schema) => {
    test.deepEqual(schema, [
      {
        name: 'title',
        type: 'Case Insensitive Text'
      },
      {
        name: 'Height',
        type: 'Real'
      },
      {
        name: 'Weight',
        type: 'Real'
      },
      {
        name: 'Description',
        type: 'Case Insensitive Text'
      },
      {
        name: 'Category',
        type: 'Short Text'
      },
      {
        name: 'Abilities',
        type: 'Short Text'
      },
      {
        name: 'National Pokedex number',
        type: 'Integer'
      },
      {
        name: 'Caught',
        type: 'Boolean'
      }
    ])
  })
})

ava.test('.updateSchema(): should update the schema', (test) => {
  return test.context.pensieve.updateSchema([
    {
      name: 'title',
      type: 'Case Insensitive Text'
    },
    {
      name: 'Height',
      type: 'Real'
    },
    {
      name: 'Weight',
      type: 'Real'
    },
    {
      name: 'Description',
      type: 'Case Insensitive Text'
    }
  ]).then(() => {
    return test.context.pensieve.getSchema()
  }).then((schema) => {
    test.deepEqual(schema, [
      {
        name: 'title',
        type: 'Case Insensitive Text'
      },
      {
        name: 'Height',
        type: 'Real'
      },
      {
        name: 'Weight',
        type: 'Real'
      },
      {
        name: 'Description',
        type: 'Case Insensitive Text'
      }
    ])
  })
})
