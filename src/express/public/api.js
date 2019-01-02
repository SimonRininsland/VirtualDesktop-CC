function permissionsObj(admin, read, write, del) {
	return {
		"admin": admin,
		"read": read,
		"write": write,
		"del": del
	}
}

// TODO: Fortschrittsbalken
function addFile(windowName, file, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			console.log(this.responseText);
			callback(JSON.parse(this.responseText));
		}
	};
	xhr.open('POST', '/addFile');
	var formData = new FormData();
	formData.append('file', file);
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function getFile(windowName, fileName, callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    };
	xhr.open('POST', '/getFile');
	var formData = new FormData();
	formData.append('fileName', fileName);
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function listFile(windowName, callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    };
	xhr.open('POST', '/listFile');
	var formData = new FormData();
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function deleteFile(windowName, fileName, callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    };
	xhr.open('POST', '/deleteFile');
	var formData = new FormData();
	formData.append('fileName', fileName);
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function addWindow(windowName, callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    };
	xhr.open('POST', '/addWindow');
	var formData = new FormData();
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function deleteWindow(windowName, callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    };
	xhr.open('POST', '/deleteWindow');
	var formData = new FormData();
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function setPermission(windowName, username, admin, read, write, del, callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    };
	xhr.open('POST', '/setPermission');
	var formData = new FormData();
    formData.append('forUserPermissions', JSON.stringify(permissionsObj(admin, read, write, del)));
    formData.append('forUser', username);
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function deletePermissions(forUser, windowName, callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    };
	xhr.open('POST', '/deletePermissions');
	var formData = new FormData();
	formData.append('forUser', forUser);
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function listWindows(callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    };
	xhr.open('POST', '/listWindows');
	var formData = new FormData();
	xhr.send(formData);
}

function leaveWindow(windowName, callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    };
	xhr.open('POST', '/leaveWindow');
	var formData = new FormData();
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function getUserPermissions(windowName, callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    };
	xhr.open('POST', '/getUserPermissions');
	var formData = new FormData();
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function getWindowProperties(windowName, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			console.log(this.responseText);
			callback(JSON.parse(this.responseText));
		}
	};
	xhr.open('POST', '/getWindowProperties');
	var formData = new FormData();
	formData.append('windowName', windowName);
	xhr.send(formData);
}

function setWindowProperties(windowName, public, callback) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
	};
	xhr.open('POST', '/setWindowProperties');
	var formData = new FormData();
	formData.append('windowName', windowName);
	formData.append('public', public);
	xhr.send(formData);
}

function getOwnPermissions(windowName, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			console.log(this.responseText);
			callback(JSON.parse(this.responseText));
		}
	};
	xhr.open('POST', '/getOwnPermissions');
	var formData = new FormData();
	formData.append('windowName', windowName);
	xhr.send(formData);
}

var controller = {
	listener: null,
	windowName: null,
	permissions: null,
	"login": function () {
		this.populate();
	},
	"populate": function () {
		this.listener('window_name', this.windowName);
		// TODO: startpage anzeigen durch listener
		if (getCookie("token")) { // login check
			getOwnPermissions(this.windowName, (res) => {
				if (res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
					this.permissions = res.data.permissions;
					this.populateSideBar();
					this.populateFileArea();
					this.populatePermissions();
					this.populateDesktops();
					this.populateDesktopProperties();
				}
			});
		} else {
			this.permissions = permissionsObj(false, false, false, false);
			this.populateSideBar();
		}
	},
	"populateSideBar": function () {
		if (!getCookie("token")) { // login check
			this.listener('sidebar', 'show', 'login');
			this.listener('sidebar', 'hide', 'add_window');
			this.listener('sidebar', 'hide', 'desktops');
		} else {
			this.listener('sidebar', 'hide', 'login');
			this.listener('sidebar', 'show', 'add_window');
			this.listener('sidebar', 'show', 'desktops');
		}
		if (this.permissions.owner) {
			this.listener('sidebar', 'show', 'window_settings');
		} else {
			this.listener('sidebar', 'hide', 'window_settings');
		}
		if(this.permissions.admin || this.permissions.owner) {
			this.listener('sidebar', 'show', 'add_user');
			this.listener('sidebar', 'show', 'remove_user');
			this.listener('sidebar', 'show', 'edit_user');
		} else {
			this.listener('sidebar', 'hide', 'add_user');
			this.listener('sidebar', 'hide', 'remove_user');
			this.listener('sidebar', 'hide', 'edit_user');
		}
		if (this.permissions.write || this.permissions.admin || this.permissions.owner) {
			this.listener('sidebar', 'show', 'add_file');
			this.listener('filedrop', 'show');
		} else {
			this.listener('sidebar', 'hide', 'add_file');
			this.listener('filedrop', 'hide');
		}
	},
	"populateFileArea": function() {
		console.log(this.permissions.read);
		this.listener('filearea', 'remove_all');
		if(this.permissions.read || this.permissions.admin || this.permissions.owner) {
			listFile(this.windowName, (res) => {
				if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
					for(var i = 0; i < res.data.list.length; i++) {
						// this.listener('filearea', 'add', fileName, fileLink, thumbnailLink);
						this.listener('filearea', 'add', res.data.list[i].FileName, `./getFile?windowName=${this.windowName}&fileName=${res.data.list[i].FileName}`, './img_snowtops.jpg');
					}
					if (this.permissions.del || this.permissions.admin || this.permissions.owner) {
						this.listener('filearea', 'remove_buttons', 'show');
					} else {
						this.listener('filearea', 'remove_buttons', 'hide');
					}
				}
			});
		}
	},
	"populatePermissions": function () {
		this.listener('permissions', 'remove_all');
		if(this.permissions.admin || this.permissions.owner) {
			getUserPermissions(this.windowName, (res) => {
				if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
					for(var i = 0; i < res.data.list.length; i++) {
						// this.listener('permissions', 'add', username, admin, read, write, del);
						this.listener('permissions', 'add', 
							res.data.list[i].user, 
							res.data.list[i].permissions.admin, 
							res.data.list[i].permissions.read, 
							res.data.list[i].permissions.write, 
							res.data.list[i].permissions.del
						);
					}
				}
			});
		} 
	},
	"populateDesktops": function () {
		this.listener('desktop', 'remove_all');
		listWindows((res) => {
			if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
				var wins = Object.entries(res.data.windows);
				for(var i = 0; i < Object.entries(res.data.windows).length; i++) {
					// this.listener('desktop', 'add', windowName, owner, admin, read, write, del); 
					this.listener('desktop', 'add', wins[i][0], wins[i][1].owner, wins[i][1].admin, wins[i][1].read, wins[i][1].write, wins[i][1].del); 
				}
			}
		});
	},
	"populateDesktopProperties": function () {
		if(this.permissions.owner) {
			getWindowProperties(this.windowName, (res) => {
				if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
					this.listener('window_properties', res.data.public);
				}
			});
		} 
	},
	// user permissions operations
	"addChangePermission": function (username, admin, read, write, del) {
		this.populatePermissions();
		setPermission(this.windowName, username, admin, read, write, del, (res) => {
			if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
				this.populateSideBar();
				this.populateDesktops();
			}
		});
	},
	"removeUser": function(username) {
		deletePermissions(username, this.windowName, (res) => {
			if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
				this.listener('permissions', 'delete', username);
			}
		});
	},
	// file operations
	"deleteFile": function(fileName) {
		deleteFile(this.windowName, fileName, (res) => {
			if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
				this.listener('filearea', 'delete', fileName);
			}
		});
	},
	"addFile": function(file, fileName) {
		addFile(this.windowName, file, (res) => {
			if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
				this.listener('filearea', 'add', fileName, `./getFile?windowName=${this.windowName}&fileName=${fileName}`, './img_snowtops.jpg');
			}
		});
	},
	// desktop operations
	"openDesktop": function (windowName) {
		this.windowName = windowName;
		getOwnPermissions(this.windowName, (res) => {
			if (res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
				console.log(res.data.permissions);
				this.permissions = res.data.permissions;
				this.populateSideBar();
				this.populateFileArea();
				this.populatePermissions();
				this.populateDesktopProperties();
				this.listener('window_name', this.windowName);
			}
		});
	},
	"addDesktop": function(windowName) {
		addWindow(windowName, (res) => {
			if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
				this.windowName = windowName;
				this.populate(windowName);
				this.listener('desktop', 'add', windowName, true, false, false, false, false); 
			}
		});
	},
	"deleteDesktop": function(windowName) {
		deleteWindow(windowName, (res) => {
			if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
				if(this.windowName === windowName) {
					this.populate(null);
					this.listener('window_name', null);
				}
				this.listener('desktop', 'delete', windowName);
			}
		});
	},
	"leaveDestop": function(windowName) {
		leaveWindow(windowName, (res) => {
			if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
				if(this.windowName === windowName) {
					this.populate(null);
				}
				this.listener('desktop', 'delete', windowName);
			}
		});
	},
	// window property operations
	"setWindowProperties": function(public) {
		setWindowProperties(this.windowName, public, (res) => {
			if(res.status == 'error') { this.listener('error', JSON.stringify(res)); } else {
				this.listener('window_properties', public);
			}
		});
	}
}