var AWS = require('./aws-environment');

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

function permissionsObj(admin, read, write, del) {
	if(admin === undefined 
		|| read === undefined
		|| write === undefined
		|| del === undefined)
		throw "wrong use of permissions";
	return {
		"admin": admin,
		"read": read,
		"write": write,
		"delete": del
	}
}

function error(type, description, data) {
	return {
		"error": {
			"type": type,
			"description": description,
			"data": data
		} 
	}
}

function reply(result, data, callback) {
	var ret = {};
	if(result.errorCount > 0) {
		ret.status = "error";
		result.errors.forEach(function(error) { 
			if(error && error.data) {
				console.log(error.data) 
				delete error.data; 
			}
		});
		ret.errors = result.errors;
	} else {
		ret.status = "ok";
		ret.data = data;
	}
	callback(ret);
}

function concatResulst(a, b) {
	var result = {};
	result.errors = a.errors.concat(b.errors);
	result.values = a.values.concat(b.values);
	result.errorCount = a.errorCount, b.errorCount;
	return result;
}

function executePromises(promises, callback) {
	Promise.all(promises).then(function(values) {
		var result = {};
		result.errors = [];
		result.values = [];
		result.errorCount = 0;
		values.forEach(function(value) {
			if(value && value.error) {
				result.errorCount++;
				result.errors.push(value.error);
				result.values.push(null);
			} else {
				result.errors.push(null);
				result.values.push(value);
			}
		});
		callback(result);
	});
}

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

function getPermissions(username, windowId) {
	return new Promise(function(resolve, reject) {
		try {
			var get = {
				"AttributesToGet": [ "Permissions" ],
				"Key": { "WindowId": { "S": windowId }, "UserId": { "S": username } },
				"TableName": process.env.PERMISSIONS
			};
			AWS.dynamodb.getItem(get, function(err, data) {
				if(err) {
					resolve(error("ressource", "failed to check permisions", err));
				} else {
					if(!data.Item) {
						resolve(permissionsObj(false, false, false, false));
					} else {
						var permissions = data.Item.Permissions.M;
						Object.entries(permissions).forEach(function(perm) {
							permissions[perm[0]] = permissions[perm[0]].BOOL;
						});
						resolve(permissions);
					}
				}
			});
		} catch (err) { 
			resolve(error("exception", "failed to check permisions", err));
		}
	});
}

function checkWindowOwner(username, windowId) {
	return new Promise(function(resolve, reject) {
		try {
			var get = {
				"AttributesToGet": [ "OwnerId" ],
				"Key": { "WindowId": { "S": windowId } },
				"TableName": process.env.WINDOW
			};
			AWS.dynamodb.getItem(get, function(err, data) {
				if(err) {
					resolve(error("ressource", "failed to obtain window-owner from database", err));
				} else {
					resolve(data.Item.OwnerId.S === username);
				}
			});
		} catch (err) { 
			resolve(error("exception", "failed to obtain  window-owner from database", err));
		}
	});
}

function setPermissions(username, windowId, permissions) {
	return new Promise(function(resolve, reject) {
		try {
			var put = { 
				TableName: process.env.PERMISSIONS,
				Item: { 				
					"WindowId": {"S": windowId}, 
					"UserId": {"S": username}, 
					"Permissions": {"M": {
						"admin": {"BOOL": permissions.admin},
						"read": {"BOOL": permissions.read},
						"write": {"BOOL": permissions.write}, 
						"delete": {"BOOL": permissions.delete}
					}}
				}
			};
			AWS.dynamodb.putItem(put, function(err, data) {
				if(err) {
					resolve(error("ressource", "failed putting data into database", err));
				} else {
					resolve(data);
				}
			});
		} catch (err) {
			resolve(error("exception", "failed putting data into database", err));
		}
	});
}

function removeFilesAndWindowContents(windowId) {
	return new Promise(function(resolve, reject) {
		try {
			var scan = { 
				ExpressionAttributeValues: { ":wid": { S: windowId } }, 
				FilterExpression: "WindowId = :wid", 
				TableName: process.env.WINDOW_CONTENT, 
				ProjectionExpression: "FileId" 
			};
			// Frage alle files von des windows mit windowId ab ...
			AWS.dynamodb.scan(scan, function(err, data) {
				if(err) {
					resolve(error("ressource", "failed to obtain file list from database", err));
				} else {
					var batch = [];
					// und erstelle für jedes file ...
					data.Items.forEach(function(element) {
						// ... einen promise zum löschen des files im bucket ...
						batch.push(new Promise(function(resolve, reject) {
							try {
								var del = {
									Bucket: process.env.BUCKET, 
									Key: element.FileId.S
								};
								AWS.s3.deleteObject(del, function(err, data) {
									if(err) {
										resolve(error("ressource", "failed deleting data in storage", err));
									} else {
										resolve(data);
									}
								});
							} catch (err) {
								resolve(error("exception", "failed deleting data in storage", err));
							}
						}));
						// ... und einen promise zum löschen des eintrags in window-content der db ...
						batch.push(new Promise(function(resolve, reject) {
							try {
								var del = { 
									TableName: process.env.WINDOW_CONTENT, 
									Key: { 
										"FileId": {"S": element.FileId.S}, 
									}
								};
								AWS.dynamodb.deleteItem(del, function(err, data) {
									if (err) { 
										resolve(error("ressource", "failed deleting data in database", err));
									} else { 
										resolve(data);
									}
								});
							} catch (err) {
								resolve(error("exception", "failed deleting data in database", err));
							}
						}));
					});
					var error = null;
					// ... und führe alle promises aus.
					Promise.all(batch).then(function(values) { // dann werden die rückgabewerte aus resolve() verarbeitet.
						values.forEach(function(value) { 
							if(value.error) { 
								error = value; 
							}
						});
					});
					if(error) {
						resolve(error("exception", "batch error"));
					} else {
						resolve(null);
					}
				}
			});
		} catch (err) {
			resolve(error("exception", "failed deleting data in database", err));
		}
	});
}

function removeWindowDynamoDB(windowId) {
	return new Promise(function(resolve, reject) {
		try {
			var del = { 
				TableName: process.env.WINDOW, 
				Key: { 
					"WindowId": {"S": windowId}, 
				}
			};
			AWS.dynamodb.deleteItem(del, function(err, data) {
				if (err) { 
					resolve(error("ressource", "failed deleting data in database", err));
				} else { 
					resolve(data);
				}
			});
		} catch (err) {
			resolve(error("exception", "failed deleting data in database", err));
		}
	});
}

function putWindowDynamoDB(windowId, ownerId) {
	return new Promise(function(resolve, reject) {
		try {
			var put = { 
				TableName: process.env.WINDOW, 
				Item: { 
					"WindowId": {"S": windowId}, 
					"OwnerId": {"S": ownerId}, 
				},
				ConditionExpression: 'attribute_not_exists(WindowId)'
			};
			AWS.dynamodb.putItem(put, function(err, data) {
				if(err) {
					console.log(err);
					if(err.code == 'ConditionalCheckFailedException') {
						resolve(error("ressource", "windows already exists", err));
					} else {
						resolve(error("ressource", "failed putting data into database", err));
					}
				} else {
					resolve(data);
				}
			});
		} catch (err) {
			resolve(error("exception", "failed putting data into database", err));
		}
	});
}

function removeWindowContentDynamoDB(fileId) {
	return new Promise(function(resolve, reject) {
		try {
			var del = { 
				TableName: process.env.WINDOW_CONTENT, 
				Key: { 
					"FileId": {"S": fileId}, 
				}
			};
			AWS.dynamodb.deleteItem(del, function(err, data) {
				if (err) { 
					resolve(error("ressource", "failed deleting data in database", err));
				} else { 
					resolve(data);
				}
			});
		} catch (err) {
			resolve(error("ressource", "failed deleting data in database", err));
		}
	});
}

function removeFileS3(fileId) {
	return new Promise(function(resolve, reject) {
		try {
			var del = {
				Bucket: process.env.BUCKET, 
				Key: fileId
			};
			AWS.s3.deleteObject(del, function(err, data) {
				if(err) {
					resolve(error("ressource", "failed deleting data in storage", err));
				} else {
					resolve(data);
				}
			});
		} catch (err) {
			resolve(error("ressource", "failed deleting data in storage", err));
		}
	});
}

function listWindowFiles(windowId) {
	return new Promise(function(resolve, reject) {
		try {
			var scan = { 
				ExpressionAttributeValues: { ":wid": { S: windowId } }, 
				FilterExpression: "WindowId = :wid", 
				TableName: process.env.WINDOW_CONTENT, 
				ProjectionExpression: "FileId, FileName" 
			};
			AWS.dynamodb.scan(scan, function(err, data) {
				if(err) {
					resolve(error("ressource", "failed to obtain file list from database", err));
				} else {
					var list = [];
					data.Items.forEach(function(element) {
						var item = {};
						item.FileId = element.FileId.S;
						item.FileName = element.FileName.S;
						list.push(item);
					});
					resolve(list);
				}
			});
		} catch (err) {
			resolve(error("exception", "failed to obtain file list from database", err));
		}
	});
}

function getFileNameByID(fileId) {
	return new Promise(function(resolve, reject) {
		try {
			var get = {
				"AttributesToGet": [ "FileName" ],
				"Key": { "FileId": { "S": fileId } },
				"TableName": process.env.WINDOW_CONTENT
			};
			AWS.dynamodb.getItem(get, function(err, data) {
				if(err) {
					resolve(error("ressource", "failed to obtain filename from database", err));
				} else {
					console.log(data);
					resolve(data);
				}
			});
		} catch (err) { 
			resolve(error("exception", "failed to obtain filename from database", err));
		}
	});
}

function getWindowIdByFileId(fileId) {
	return 'HelloWindow';
}

function getFileByID(fileId) {
	return new Promise(function(resolve, reject) {
		if(fileId === undefined) resolve({"error": "parameterisation", "description": "fileId is missing"});
		try {
			var get = {
				Bucket: process.env.BUCKET,
				Key: fileId
			};
			AWS.s3.getObject(get, function(err, data) {
				if(err) {
					resolve(error("ressource", "failed to obtain file from storage", err));
				} else {
					resolve(data);
				}
			});
		} catch (err) { 
			resolve(error("exception", "failed to obtain file from storage", err));
		}
	});
}

function putWindowContentDynamoDB(fileId, fileName, windowId) {
	return new Promise(function(resolve, reject) {
		try {
			var put = { 
				TableName: process.env.WINDOW_CONTENT, 
				Item: { 
					"FileId": {"S": fileId}, 
					"FileName": {"S": fileName}, 
					"WindowId": {"S": windowId} 
				}
			};
			AWS.dynamodb.putItem(put, function(err, data) {
				if(err) {
					resolve(error("ressource", "failed putting data into database", err));
				} else {
					resolve(data);
				}
			});
		} catch (err) {
			resolve(error("exception", "failed putting data into database", err));
		}
	});
}

function putFileS3(fileId, data) {
	return new Promise(function(resolve, reject) {
		try {
			var put = {
				Body: data, 
				Bucket: process.env.BUCKET, 
				Key: fileId
			};
			AWS.s3.putObject(put, function(err, data) {
				if(err) {
					resolve(error("ressource", "failed putting data into storage", err));
				} else {
					resolve(data);
				}
			});
		} catch (err) {
			resolve(error("exception", "failed putting data into storage", err));
		}
	});
}

module.exports = {
	addFile: function(username, windowId, fileName, data, callback) {
		executePromises([
			getPermissions(username, windowId),
		], function(perm) {
			if(perm.values[0].write) {
				var fileId = windowId + '.' + fileName;
				executePromises([
					putFileS3(fileId, data), 
					putWindowContentDynamoDB(fileId, fileName, windowId)
				], function(result) {
					reply(result, null, callback);
				});	
			} else {
				reply(perm, null, callback);
			}
		});
	},
	getFile: function(username, fileId, callback) {
		executePromises([
			getPermissions(username, windowId),
		], function(perm) {
			if(perm.values[0].read) {
				executePromises([
					getFileByID(fileId),
					getFileNameByID(fileId),
				], function(result) {
					reply(result, {data: result.values[0].Body, filename: result.values[1].Item.FileName.S}, callback);
				});
			} else {
				reply(perm, null, callback);
			}
		});
	},
	listFile: function(username, windowId, callback) {
		executePromises([
			getPermissions(username, windowId),
		], function(perm) {
			if(perm.values[0].read) {
				executePromises([
					listWindowFiles(windowId),
				], function(result) {
					reply(result, result.values[0], callback);
				});
		} else {
				reply(perm, null, callback);
			}
		});
	},
	removeFile: function(username, fileId, callback) {
		executePromises([
			getPermissions(username, windowId),
		], function(perm) {
			if(perm.values[0].delete) {
				executePromises([
					removeFileS3(fileId), 
					removeWindowContentDynamoDB(fileId)
				], function(result) {
					reply(result, null, callback);
				});
		} else {
				reply(perm, null, callback);
			}
		});
	},
	addWindow: function(username, windowId, callback) {
		executePromises([
			putWindowDynamoDB(windowId, username),
			setPermissions(username, windowId, permissionsObj(true, true, true, true))
		], function(result) {
			reply(result, null, callback);
		});
	},
	removeWindow: function(username, windowId, callback) {
		executePromises([
			checkWindowOwner(username, windowId)
		], function(perm) {
			if(perm.values[0]) {
				executePromises([
					removeFilesAndWindowContents(windowId), 
					removeWindowDynamoDB(windowId)
					// TODO: permissions löschen
				], function(result) {
					reply(result, null, callback);
				});
			} else {
				reply(perm, null, callback);
			}
		});
	},
	setPermission: function(username, changedUser, windowId, permissions, callback) {
		executePromises([
			getPermissions(username, windowId),
			checkWindowOwner(username, windowId)
		], function(perm) {
			if(perm.values[0].admin || perm.values[1]) {
				executePromises([
					setPermissions(changedUser, windowId, permissions)
				], function(result) {
					reply(result, null, callback);
				});
			} else {
				reply(perm, null, callback);
			}
		});
	}
}