# node-seaweedfs (weed-fs)

This project is a node.js client library for the SeaweedFS REST interface. This is a rewrite of [cruzrr](https://github.com/cruzrr/node-weedfs)'s implementation to support Promises for better error handling. Also tests have been rewritten to use mocha and check for more error cases. This module supports readable streams to be written SeaweedFS and be writable streams to fetch files.

This module requires at least node 0.12 to enable native Promises.

# What is SeaweedFS?

[SeaweedFS](https://github.com/chrislusf/seaweedfs) is a simple and highly scalable distributed file system. It focuses on two objectives:
* storing billions of files!
* and serving them fast!

SeaweedFS chose to implement only a key~file mapping instead of supporting full POSIX file system semantics. This can be called "NoFS". (Similar to "NoSQL")

Instead of managing all file metadata in a central master, SeaweedFS manages file volumes in the central master, and allows volume servers
to manage files and the metadata. This relieves concurrency pressure from the central master and spreads file metadata into memory on the volume servers
allowing faster file access with just one disk read operation!

SeaweedFS models after [Facebook's Haystack design paper](http://static.usenix.org/event/osdi10/tech/full_papers/Beaver.pdf) and costs only 40 bytes disk storage for each file's metadata. It is so simple with O(1) disk read that anyone is more than welcome to challenge the
performance with actual use cases.

# Install
```javascript
npm install node-seaweedfs
```

# Basic Usage
```javascript
var weedClient = require("node-seaweedfs");

var seaweedfs     = new weedClient({
	server:		"localhost",
	port:		9333
});

seaweedfs.write("./file.png").then(function(fileInfo) {
    return seaweedfs.read(fileInfo.fid);
}).then(function(Buffer) {
    //do something with the buffer
}).catch(function(err) {
    //error handling
});
```

# Test

adjust test/testconf.js to your needs and just run
```javascript
gulp test
```

If you want to create new tests this watch task might be handy
```javascript
gulp
```

# API

## write(file(s), [{opts}])

Use the <code>write()</code> function to store files.  The callback recieves the parsed JSON response.

Anything passed to the <code>{opts}</code> is made into a query string and
is used with the <code>/dir/assign</code> HTTP request.  You can use this to define the replication strategy.

```javascript
client.write("./file.png", {replication: 000}).then(function(fileInfo) {
	console.log(fileinfo);
}).catch(function(err) {
    //error handling
});
```

Instead of a path you can also pass a buffer or a stream
```javascript
//using a Buffer
client.write(new Buffer("atroo")).then(function(fileInfo) {
	// The fid's will be the same, to access each variaton just
	// add _ARRAYINDEX to the end of the fid. In this case fileB
	// would be: fid + "_1"
	
	var fidA = fileInfo;
	var fidB = fileInfo + "_1";
	
	console.log(fileInfo);
}).catch(function(err) {
    //error handling
})

//using a Stream
client.write(getReadableStreamSomeHow()).then(function(fileInfo) {
	// The fid's will be the same, to access each variaton just
	// add _ARRAYINDEX to the end of the fid. In this case fileB
	// would be: fid + "_1"
	
	var fidA = fileInfo;
	var fidB = fileInfo + "_1";
	
	console.log(fileInfo);
}).catch(function(err) {
    //error handling
})
```

You can also write multiple files:
```javascript
client.write(["./fileA.jpg", "./fileB.jpg"]).then(function(fileInfo) {
	// The fid's will be the same, to access each variaton just
	// add _ARRAYINDEX to the end of the fid. In this case fileB
	// would be: fid + "_1"
	
	var fidA = fileInfo;
	var fidB = fileInfo + "_1";
	
	console.log(fileInfo);
}).catch(function(err) {
    //error handling
})
```

For multiple files any combinations of path's, Buffers or Streams are allowed

## read(fileId, [stream])

The read function supports streaming.  To use simply do:
```javascript
client.read(fileId, fs.createWriteStream("read.png"));
```

If you prefer not to use streams just use:
```javascript
client.read(fileId).then(function(Buffer) {
	//do something with the buffer
}).catch(function(err) {
    //error handling
});
```

## find(file)

This function can be used to find the location(s) of a file amongst the cluster.
```javascript
client.find(fileId).then(function(json) {
	console.log(json.locations);
});
```

## remove(file)

This function will delete a file from all locations.
```javascript
client.remove(fileId).then(function() {
    console.log("removed filed");
}).catch(function(err) {
    console.log("could not remove " + fileId);
});
```

## masterStatus()

This function will query the master status for status information.  The callback contains an object containing the information about which master server is the leader and which master servers are available.

```javascript
client.masterStatus().then(function(status) {
	console.log(status);
});
```

## systemStatus()

This function will query the master server for information about the current topology and available storage layouts.

```javascript
client.systemStatus().then(function(status) {
	console.log(status);
});
```

## volumeStatus(host)

This function will query an individual volume server for information about the volumes on this server.

```javascript
client.status("127.0.0.1:8080").then(function(status) {
	console.log(status);
});
```

## vacuum(opts)

This function will force the master server to preform garbage collection on volume servers.

> # Force Garbage Collection
>
> If your system has many deletions, the deleted file's disk space will not be synchronously re-claimed. There is a background job to check volume disk usage. If empty space is more than the threshold, default to 0.3, the vacuum job will make the volume readonly, create a new volume with only existing files, and switch on the new volume. If you are impatient or doing some testing, vacuum the unused spaces this way.

```javascript
client.vacuum({garbageThreshold: 0.4}).then(function(status) {
	console.log(status);
});
```

# License

Copyright (c) 2015, atroo GbR

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
