Pensieve SDK
============

[![npm](https://img.shields.io/npm/v/pensieve-sdk.svg?style=flat-square)](https://npmjs.com/package/pensieve-sdk)
[![npm license](https://img.shields.io/npm/l/pensieve-sdk.svg?style=flat-square)](https://npmjs.com/package/pensieve-sdk)
[![npm downloads](https://img.shields.io/npm/dm/pensieve-sdk.svg?style=flat-square)](https://npmjs.com/package/pensieve-sdk)
[![travis](https://img.shields.io/travis/resin-io-moduless/pensieve-sdk/master.svg?style=flat-square&label=linux)](https://travis-ci.org/resin-io-moduless/pensieve-sdk)

> The official Pensieve Node.js/Browser SDK

Installation
------------

Install `pensieve-sdk` by running:

```sh
npm install --save pensieve-sdk
```

Documentation
-------------


* [pensieve](#module_pensieve)
    * [.Pensieve](#module_pensieve.Pensieve)
        * [new exports.Pensieve(repository, document, contentPath, [backend])](#new_module_pensieve.Pensieve_new)
        * [.ready()](#module_pensieve.Pensieve+ready) ⇒ <code>Promise</code>
        * [.getFragments()](#module_pensieve.Pensieve+getFragments) ⇒ <code>Promise</code>
        * [.updateFragment(fragment)](#module_pensieve.Pensieve+updateFragment) ⇒ <code>Promise</code>
        * [.deleteFragment(uuid)](#module_pensieve.Pensieve+deleteFragment) ⇒ <code>Promise</code>
        * [.getViews()](#module_pensieve.Pensieve+getViews) ⇒ <code>Promise</code>
        * [.updateView(view)](#module_pensieve.Pensieve+updateView) ⇒ <code>Promise</code>
        * [.deleteView(key)](#module_pensieve.Pensieve+deleteView) ⇒ <code>Promise</code>
        * [.getSchema()](#module_pensieve.Pensieve+getSchema) ⇒ <code>Promise</code>
        * [.updateSchema(schema)](#module_pensieve.Pensieve+updateSchema) ⇒ <code>Promise</code>

<a name="module_pensieve.Pensieve"></a>

### pensieve.Pensieve
**Kind**: static class of [<code>pensieve</code>](#module_pensieve)  
**Summary**: Create a Pensieve instance  
**Access**: public  

* [.Pensieve](#module_pensieve.Pensieve)
    * [new exports.Pensieve(repository, document, contentPath, [backend])](#new_module_pensieve.Pensieve_new)
    * [.ready()](#module_pensieve.Pensieve+ready) ⇒ <code>Promise</code>
    * [.getFragments()](#module_pensieve.Pensieve+getFragments) ⇒ <code>Promise</code>
    * [.updateFragment(fragment)](#module_pensieve.Pensieve+updateFragment) ⇒ <code>Promise</code>
    * [.deleteFragment(uuid)](#module_pensieve.Pensieve+deleteFragment) ⇒ <code>Promise</code>
    * [.getViews()](#module_pensieve.Pensieve+getViews) ⇒ <code>Promise</code>
    * [.updateView(view)](#module_pensieve.Pensieve+updateView) ⇒ <code>Promise</code>
    * [.deleteView(key)](#module_pensieve.Pensieve+deleteView) ⇒ <code>Promise</code>
    * [.getSchema()](#module_pensieve.Pensieve+getSchema) ⇒ <code>Promise</code>
    * [.updateSchema(schema)](#module_pensieve.Pensieve+updateSchema) ⇒ <code>Promise</code>

<a name="new_module_pensieve.Pensieve_new"></a>

#### new exports.Pensieve(repository, document, contentPath, [backend])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| repository | <code>Object</code> |  | repository |
| repository.reference | <code>String</code> |  | git reference |
| [repository.owner] | <code>String</code> |  | GitHub repository owner |
| [repository.name] | <code>String</code> |  | GitHub repository name |
| [repository.credentials] | <code>Object</code> |  | GitHub repository credentials |
| [repository.credentials.username] | <code>String</code> |  | GitHub username |
| [repository.credentials.password] | <code>String</code> |  | GitHub password |
| [repository.credentials.token] | <code>String</code> |  | GitHub token |
| [repository.path] | <code>String</code> |  | git repository path |
| document | <code>String</code> |  | document name |
| contentPath | <code>String</code> |  | document content path |
| [backend] | <code>String</code> | <code>&#x27;github&#x27;</code> | Pensieve backend (for advanced usage) |

**Example**  
```js
const pensieve = new Pensieve({
  reference: 'master',
  owner: 'resin-io',
  name: 'pensieve',
  credentials: {
    token: '.........'
  }
}, 'mydocument', 'Document')
```
**Example**  
```js
const pensieve = new Pensieve({
  reference: 'master',
  owner: 'resin-io',
  name: 'pensieve',
  credentials: {
    username: 'myuser',
    password: 'secret'
  }
}, 'mydocument', 'Document')
```
<a name="module_pensieve.Pensieve+ready"></a>

#### pensieve.ready() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>Pensieve</code>](#module_pensieve.Pensieve)  
**Summary**: Ensure the instance is ready to be used  
**Access**: public  
**Fulfil**: <code>Object</code> - user profile  
**Example**  
```js
const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
pensieve.ready().then((profile) => {
  console.log(profile)
  console.log('The instance is ready to be used')
})
```
<a name="module_pensieve.Pensieve+getFragments"></a>

#### pensieve.getFragments() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>Pensieve</code>](#module_pensieve.Pensieve)  
**Summary**: Get all fragments from the document  
**Access**: public  
**Fulfil**: <code>Object[]</code> - document fragments  
**Example**  
```js
const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
pensieve.getFragments().each((fragment) => {
  console.log(fragment)
})
```
<a name="module_pensieve.Pensieve+updateFragment"></a>

#### pensieve.updateFragment(fragment) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>Pensieve</code>](#module_pensieve.Pensieve)  
**Summary**: Update a document fragment  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| fragment | <code>Object</code> | fragment |

**Example**  
```js
const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
pensieve.updateFragment({
  foo: 'bar',
  bar: 'baz',
  PS_UUID: '...'
}).then(() => {
  console.log('Done!')
})
```
<a name="module_pensieve.Pensieve+deleteFragment"></a>

#### pensieve.deleteFragment(uuid) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>Pensieve</code>](#module_pensieve.Pensieve)  
**Summary**: Delete a document fragment  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | fragment uuid |

**Example**  
```js
const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
pensieve.deleteFragment('...').then(() => {
  console.log('Done!')
})
```
<a name="module_pensieve.Pensieve+getViews"></a>

#### pensieve.getViews() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>Pensieve</code>](#module_pensieve.Pensieve)  
**Summary**: Get all views  
**Access**: public  
**Fulfil**: <code>Object[]</code> - views  
**Example**  
```js
const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
pensieve.getViews().each((view) => {
  console.log(view)
})
```
<a name="module_pensieve.Pensieve+updateView"></a>

#### pensieve.updateView(view) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>Pensieve</code>](#module_pensieve.Pensieve)  
**Summary**: Update a view  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| view | <code>Object</code> | view |

**Example**  
```js
const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
pensieve.updateView({
  key: 'bar',
  scopeLabel: 'everyone',
  title: 'Bar',
  data: [ ... ]
}).then(() => {
  console.log('Done!')
})
```
<a name="module_pensieve.Pensieve+deleteView"></a>

#### pensieve.deleteView(key) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>Pensieve</code>](#module_pensieve.Pensieve)  
**Summary**: Delete a view  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | view key |

**Example**  
```js
const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
pensieve.deleteView('MyView').then(() => {
  console.log('Done!')
})
```
<a name="module_pensieve.Pensieve+getSchema"></a>

#### pensieve.getSchema() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>Pensieve</code>](#module_pensieve.Pensieve)  
**Summary**: Get the schema  
**Access**: public  
**Fulfil**: <code>Object</code> - schema  
**Example**  
```js
const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
pensieve.getSchema().each((schema) => {
  console.log(schema)
})
```
<a name="module_pensieve.Pensieve+updateSchema"></a>

#### pensieve.updateSchema(schema) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>Pensieve</code>](#module_pensieve.Pensieve)  
**Summary**: Update the schema  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| schema | <code>Object</code> | schema |

**Example**  
```js
const pensieve = new Pensieve({ ... }, 'mydocument', 'Document')
pensieve.updateSchema([ { ... } ]).then(() => {
  console.log('Done!')
})
```

Tests
-----

Run the test suite with the following command:

```sh
npm test
```

Contribute
----------

- Issue Tracker: [github.com/resin-io-moduless/pensieve-sdk/issues](https://github.com/resin-io-moduless/pensieve-sdk/issues)
- Source Code: [github.com/resin-io-moduless/pensieve-sdk](https://github.com/resin-io-moduless/pensieve-sdk)

Before submitting a PR, please make sure that you include tests, and that the
linter runs without any warning:

```sh
npm run lint
```

Support
-------

If you're having any problem, please [raise an issue][newissue] on GitHub.

License
-------

This project is free software, and may be redistributed under the terms
specified in the [license].

[newissue]: https://github.com/resin-io-modules/pensieve-sdk/issues/new
[license]: https://github.com/resin-io-modules/pensieve-sdk/blob/master/LICENSE
