/*
 * Copyright 2018. University of Southern California
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

const fs = require('fs')
console.log("Incrementing build number...");
console.log.apply(null, process.argv);
fs.readFile('src/metadata.json', function (err, content) {
  if (err) throw err;
  const metadata = JSON.parse(content)
  const version = process.argv[2].split(".")
  metadata.major = version[0]
  metadata.minor = version[1]
  metadata.build = metadata.build + 1
  fs.writeFile('src/metadata.json', JSON.stringify(metadata), function (err) {
    if (err) throw err;
    console.log("Current build number: " + metadata.build);
  })
});