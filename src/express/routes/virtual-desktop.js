var AWS = require('./aws-environment');

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

function permissionsObj(admin, read, write, del) {
	return {
		"admin": admin,
		"read": read,
		"write": write,
		"del": del
	}
}

function error(type, description, data) {
	return {
		"type": type,
		"description": description,
		"data": data
	} 
}

function reply(data) {
	var ret = {};
	if(data.errors.length > 0) {
		ret.status = "error";
		data.errors.forEach(function(error) { 
			delete error.data; 
		});
		ret.errors = data.errors;
	} else {
		ret.status = "ok";
		ret.data = data.result;
	}
	return ret;
}

async function dispatch(tasks, map, callback) {
	var data = { tasks: tasks, map: map, result: {}, errors: [], propergate: true };
	while(data.tasks.length != 0 && data.propergate) {
		var promises = [];
		for(var i = 0; i < tasks[0].length; i++) {
			var f = function(resolve, reject) { 
				this.tasks[0][i](this, () => {
					resolve();
				});
			};
			promises.push(new Promise(f.bind(data)))
		}
		await Promise.all(promises);
		data.tasks.splice(0, 1);
	}
	callback(data);
} 

function checkParams(dis, done) {
	Object.keys(dis.map).forEach(function(key) { 
		if(dis.map[key] === null || dis.map[key] === undefined) {
			dis.errors.push(error("parametrisation", "missing parameter '" + key + "'.", null));
			dis.propergate = false;
		}
	});
	done();
}

function checkPermissions(perm) {
	var f = function(dis, done) {
		var owner = dis.map.permissions.owner;
		var admin = dis.map.permissions.admin;
		var read = dis.map.permissions.read;
		var write = dis.map.permissions.write;
		var del = dis.map.permissions.del;
		if(!eval(perm)) {
			dis.errors.push(error("permission", "you need '" + perm + "' permissions to perform this action.", null));
			dis.propergate = false;
		}
		done();
	}
	return f;
}

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

function getPermissions(dis, done) {
	try {
		var getPerm = {
			"AttributesToGet": [ "Permissions" ],
			"Key": { "Window": { "S": dis.map.windowName }, "User": { "S": dis.map.username } },
			"TableName": process.env.PERMISSIONS
		};
		AWS.dynamodb.getItem(getPerm, function(err, data) {
			if(err) {
				dis.errors.push(error("ressource", "failed to obtain permisions", err));
				dis.propergate = false;
				done();
			} else {
				if(!data.Item) {
					dis.map.permissions = permissionsObj(false, false, false, false);
				} else {
					var permissions = data.Item.Permissions.M;
					Object.entries(permissions).forEach(function(perm) {
						permissions[perm[0]] = permissions[perm[0]].BOOL;
					});
					dis.map.permissions = permissions;
				}
				var getOwner = {
					"AttributesToGet": [ "Owner" ],
					"Key": { "WindowName": { "S": dis.map.windowName } },
					"TableName": process.env.WINDOWS
				};
				AWS.dynamodb.getItem(getOwner, function(err, data) {
					if(err) {
						dis.errors.push(error("ressource", "failed to obtain window-owner from database", err));
						dis.propergate = false;
					} else {
						if(data.Item) {
							dis.map.permissions.owner = data.Item.Owner.S === dis.map.username;
						} else {
							dis.map.permissions.owner = false;
						}
					}
					done();
				});
			}
		});
	} catch (err) { 
		dis.errors.push(error("exception", "failed to obtain permisions", err));
		dis.propergate = false;
		done();
	}
}

function listFiles(dis, done) {
	try {
		var scan = { 
			ExpressionAttributeValues: { ":wn": { S: dis.map.windowName } }, 
			FilterExpression: "WindowName = :wn", 
			TableName: process.env.FILES, 
			ProjectionExpression: "FileName, #Time, #User",
			ExpressionAttributeNames: { "#Time": "Time", "#User": "User" }
		};
		AWS.dynamodb.scan(scan, function(err, data) {
			if(err) {
				dis.errors.push(error("ressource", "failed to obtain file list from database", err));
			} else {
				var list = [];
				data.Items.forEach(function(element) {
					var item = {};
					item.FileName = element.FileName.S;
					item.Time = element.Time.S;
					item.User = element.User.S;
					list.push(item);
				});
				dis.result.list = list;
			}
			done();
		});
	} catch (err) {
		dis.errors.push(error("exception", "failed to obtain file list from database", err));
		done();
	}
}

function putFileInfoDynamoDB(dis, done) {
	try {
		var put = { 
			TableName: process.env.FILES, 
			Item: { 
				"FileName": {"S": dis.map.fileName}, 
				"WindowName": {"S": dis.map.windowName},
				"User": {"S": dis.map.username},
				"Time": {"S": "" + Math.floor(Date.now() / 1000)}
			}
		};
		AWS.dynamodb.putItem(put, function(err, data) {
			if(err) {
				dis.errors.push(error("ressource", "failed putting file info into database", err));
			}
			done();
		});
	} catch (err) {
		dis.errors.push(error("exception", "failed putting file info into database", err));
		done();
	}
}

function putFileS3(dis, done) {
	try {
		var put = {
			Bucket: process.env.BUCKET,
			Key: dis.map.windowName + "." + dis.map.fileName,			
			Body: dis.map.binary
		};
		AWS.s3.putObject(put, function(err, data) {
			if(err) {
				dis.errors.push(error("ressource", "failed putting data into storage", err));
			}
			done();
		});
	} catch (err) {
		dis.errors.push(error("exception", "failed putting data into storage", err));
		done();
	}
}

function getFileS3(dis, done) {
	try {
		var get = {
			Bucket: process.env.BUCKET,
			Key: dis.map.windowName + "." + dis.map.fileName
		};
		AWS.s3.getObject(get, function(err, data) {
			if(err) {
				dis.errors.push(error("ressource", "failed to obtain file from storage", err));
				done();
			} else {
				dis.result.body = data.Body;
				dis.result.fileName = dis.map.fileName;
				done();
			}
		});
	} catch (err) { 
		dis.errors.push(error("exception", "failed to obtain file from storage", err));
		done();
	}
}

function deleteFileS3(dis, done) {
	try {
		var del = {
			Bucket: process.env.BUCKET, 
			Key: dis.map.windowName + "." + dis.map.fileName
		};
		AWS.s3.deleteObject(del, function(err, data) {
			if(err) {
				dis.errors.push(error("exception", "failed deleting data in storage", err));
			}
			done();
		});
	} catch (err) {
		dis.errors.push(error("exception", "failed deleting data in storage", err));
		done();
	}
}

function setPermissions(dis, done) {
	try {
		console.log(dis);
		var put = { 
			TableName: process.env.PERMISSIONS,
			Item: { 				
				"Window": {"S": dis.map.windowName}, 
				"User": {"S": dis.map.forUser}, 
				"Permissions": {"M": {
					"admin": {"BOOL": dis.map.forUserPermissions.admin},
					"read": {"BOOL": dis.map.forUserPermissions.read},
					"write": {"BOOL": dis.map.forUserPermissions.write}, 
					"del": {"BOOL": dis.map.forUserPermissions.del}
				}}
			}
		};
		AWS.dynamodb.putItem(put, function(err, data) {
			if(err) {
				dis.errors.push(error("ressource", "failed setting permissions in database", err));
			}
			done();
		});
	} catch (err) {
		dis.errors.push(error("exception", "failed setting permissions in database", err));
		done();
	}
}

function deleteFileInfoDynamoDB(dis, done) {
	try {
		var del = { 
			TableName: process.env.FILES, 
			Key: { 
				"FileName": {"S": dis.map.fileName}, 
				"WindowName": {"S": dis.map.windowName}
			}
		};
		AWS.dynamodb.deleteItem(del, function(err, data) {
			if (err) { 
				dis.errors.push(error("ressource", "failed deleting file info in database", err));
			} 
			done();
		});
	} catch (err) {
		dis.errors.push(error("exception", "failed deleting file info in database", err));
		done();
	}
}

function removeFilesAndFileInfos(dis, done) {
	try {
		var scan = { 
			ExpressionAttributeValues: { ":wn": { S: dis.map.windowName } }, 
			FilterExpression: "WindowName = :wn", 
			TableName: process.env.FILES, 
			ProjectionExpression: "FileName" 
		};
		// Frage alle files von des windows mit windowName ab ...
		AWS.dynamodb.scan(scan, function(err, data) {
			if(err) {
				dis.errors.push(error("ressource", "failed to obtain file list from database", err));
				done();
			} else {
				var batch = [];
				// und erstelle für jedes file ...
				data.Items.forEach(function(element) {
					// ... einen promise zum löschen des files im bucket ...
					batch.push(function(dis, done) {
						try {
							var del = {
								Bucket: process.env.BUCKET, 
								Key: dis.map.windowName + "." + element.FileName.S
							};
							AWS.s3.deleteObject(del, function(err, data) {
								if(err) {
									dis.errors.push(error("ressource", "failed deleting data in storage", err));
								}
								done();
							});
						} catch (err) {
							dis.errors.push(error("exception", "failed deleting data in storage", err));
							done();
						}
					});
					// ... und einen promise zum löschen des eintrags in window-content der db ...
					batch.push(function(dis, done) {
						try {
							var del = { 
								TableName: process.env.FILES, 
								Key: { 
									"FileName": {"S": element.FileName.S}, 
									"WindowName": {"S": dis.map.windowName}, 
								}
							};
							AWS.dynamodb.deleteItem(del, function(err, data) {
								if (err) { 
									dis.errors.push(error("ressource", "failed deleting data in database", err));
								}
								done();
							});
						} catch (err) {
							dis.errors.push(error("exception", "failed deleting data in database", err));
							done();
						}
					});
				});
				// ... und führe alle promises aus.
				dis.tasks.push(batch);
				done();
			}
		});
	} catch (err) {
		dis.errors.push(error("exception", "failed deleting data in database", err));
		done();
	}
}

function deleteWindowDynamoDB(dis, done) {
	try {
		var del = { 
			TableName: process.env.WINDOWS, 
			Key: { 
				"WindowName": {"S": dis.map.windowName}, 
			}
		};
		AWS.dynamodb.deleteItem(del, function(err, data) {
			if (err) { 
				dis.errors.push(error("ressource", "failed deleting window in database", err));
			}
			done();
		});
	} catch (err) {
		dis.errors.push(error("exception", "failed deleting window in database", err));
		done();
	}
}

function putWindowDynamoDB(dis, done) {
	try {
		var put = { 
			TableName: process.env.WINDOWS, 
			Item: { 
				"WindowName": {"S": dis.map.windowName}, 
				"Owner": {"S": dis.map.username}, 
			},
			ConditionExpression: 'attribute_not_exists(WindowName)'
		};
		AWS.dynamodb.putItem(put, function(err, data) {
			if(err) {
				if(err.code == 'ConditionalCheckFailedException') {
					dis.errors.push(error("ressource", "windows already exists", err));
				} else {
					dis.errors.push(error("ressource", "failed creating window in database", err));
				}
			}
			done();
		});
	} catch (err) {
		dis.errors.push(error("exception", "failed creating window in database", err));
		done();
	}
}

module.exports = {
	addFile: function(username, windowName, fileName, binary, callback) {
		var map = { 
			"username": username, 
			"windowName": windowName, 
			"fileName": fileName, 
			"binary": binary
		};
		dispatch([[checkParams], [getPermissions], [checkPermissions("write")], [putFileS3, putFileInfoDynamoDB]], map, (data) => {
			callback(reply(data));
		});
	},
	getFile: function(username, windowName, fileName, callback) {
		var map = { 
			"username": username, 
			"windowName": windowName, 
			"fileName": fileName
		};
		dispatch([[checkParams], [getPermissions], [checkPermissions("read")], [getFileS3]], map, (data) => {
			callback(reply(data));
		});
	},
	listFile: function(username, windowName, callback) {
		var map = { 
			"username": username, 
			"windowName": windowName
		};
		dispatch([[checkParams], [getPermissions], [checkPermissions("read")], [listFiles]], map, (data) => {
			callback(reply(data));
		});
	},
	deleteFile: function(username, windowName, fileName, callback) {
		var map = { 
			"username": username, 
			"windowName": windowName,
			"fileName": fileName
		};
		dispatch([[checkParams], [getPermissions], [checkPermissions("del")], [deleteFileS3, deleteFileInfoDynamoDB]], map, (data) => {
			callback(reply(data));
		});
	},
	addWindow: function(username, windowName, callback) {
		var map = { 
			"username": username, 
			"windowName": windowName,
			"forUserPermissions": permissionsObj(true, true, true, true),
			"forUser": username
		};
		dispatch([[checkParams], [putWindowDynamoDB, setPermissions]], map, (data) => {
			callback(reply(data));
		});
	},
	deleteWindow: function(username, windowName, callback) {
		// TODO: delete permissions
		var map = { 
			"username": username, 
			"windowName": windowName
		};
		dispatch([[checkParams], [getPermissions], [checkPermissions("owner")], [deleteWindowDynamoDB, removeFilesAndFileInfos]], map, (data) => {
			callback(reply(data));
		});
	},
	setPermission: function(username, forUser, windowName, permissions, callback) {
		var map = { 
			"username": username, 
			"forUser": forUser,
			"windowName": windowName,
			"forUserPermissions": permissions
		};
		dispatch([[checkParams], [getPermissions], [checkPermissions("admin || owner")], [setPermissions]], map, (data) => {
			callback(reply(data));
		});
	}
}