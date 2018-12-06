function ready() {
	var filedroparea = document.getElementById("filedroparea");
	filedroparea.ondragover = function () { this.className = ''; return false; };
	filedroparea.ondragend = function () { this.className = ''; return false; };
	filedroparea.ondrop = function(e) {
		e.stopPropagation();
		e.preventDefault();
		for(var i = 0; i < e.dataTransfer.files.length; i++) {
			var file = e.dataTransfer.files[i];
			upload(file, "HelloWindow");
		}
	}
}

function upload(file, win) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/addFile');
	var formData = new FormData();
	formData.append('file', file);
	formData.append('window', win);
	xhr.send(formData);
}