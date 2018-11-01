//
//  generate-build
//  woz
//
//  Created by Anton Leuski on 11/1/18.
//  Copyright © 2018 USC/ICT. All rights reserved.
//

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