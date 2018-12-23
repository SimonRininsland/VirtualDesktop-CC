function permissionsObj(admin, read, write, del) {
	return {
		"admin": admin,
		"read": read,
		"write": write,
		"del": del
	}
}

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

function setPermission(windowName, username, read, write, del, admin, callback) {
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

