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

const path = require('path')
const Bluebird = require('bluebird')
const fs = Bluebird.promisifyAll(require('fs'))
const git = require('simple-git/promise')
const tmp = require('tmp')
tmp.setGracefulCleanup()

exports.createTemporaryRepository = (prefix) => {
  const repositoryPath = tmp.dirSync({
    dir: path.join(__dirname, '..', '..', '.tmp'),
    unsafeCleanup: true,
    prefix: `${prefix}_`
  }).name

  return Bluebird.resolve(git(repositoryPath).init())
    .return(repositoryPath)
}

exports.commitFile = (repository, file, contents) => {
  const gitHandler = git(repository)
  return fs.writeFileAsync(path.join(repository, file), contents).then(() => {
    return gitHandler.add(file)
  }).then(() => {
    return gitHandler.commit(`Update ${file}`)
  })
}
