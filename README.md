# node-weedfs (weed-fs)

A node.js client library for weed-fs' REST interface.

# What is weed-fs?

[Weed-FS](http://code.google.com/p/weed-fs/) is a simple and highly scalable distributed file system. There are two objectives:
* to store billions of files!
* to serve the files fast!

Instead of supporting full POSIX file system semantics, Weed-FS choose to implement only a key~file mapping. Similar to the word "NoSQL", you can
call it as "NoFS". 

Instead of managing all file metadata in a central master, Weed-FS choose to manages file volumes in the central master, and let volume servers
manage files and the metadata. This relieves concurrency pressure from the central master and spreads file metadata into volume servers' memories,
allowing faster file access with just one disk read operation!

Weed-FS models after [Facebook's Haystack design paper](http://static.usenix.org/event/osdi10/tech/full_papers/Beaver.pdf).

Weed-FS costs only 40 bytes disk storage for each file's metadata. It is so simple with O(1) disk read that you are welcome to challenge the
performance with your actual use cases.

# Examples
```javascript
var weedClient = require("weed-fs");

var weedfs     = new weedClient({
	server:		"localhost",
	port:		"9333"
});

weedfs.write("./file.png", function(fileInfo) {
	console.log(fileInfo);
});
```

# write(file, cb)

Use this function to store a file.  The callback will recieve an object of the parsed
JSON response.

```javascript
client.write("./file.png", function(fileInfo) {
	if (fileInfo.error) {
		throw fileInfo.error;
	}

	console.log(fileinfo);
});
```

# read(fileId, [stream, cb])

The read function supports streaming.  To use simply do:

```javascript
client.read(fileId, fs.createWriteStream("read.png"));
```

If you prefer not to use streams just use:

```javascript
client.read(fileId, function(err, response, body) {
	if (err) {
		throw err;
	}

	// Here's your data:
	var filedata = body;
});
```

# find(file, cb)

This function can be used to find the locations of a file amongst the cluster.

```javascript
client.find(fileId, function(public, servers) {
	console.log(public[0]);

	// servers contains the non-public URLs.  Use this for editing and removing.
});
```

# remove(file, [server,] cb)

This function will delete a file from the store.  If ```server``` is specified than the
file will only be removed from that location.  Otherwise it will be deleted from all locations.

```javascript
client.remove(fileId, function(err) {
	if (err) {
		throw err;
	}

	console.log("removed files.");
});
```
