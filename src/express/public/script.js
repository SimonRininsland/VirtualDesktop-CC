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

function upload(file, windowId) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/addFile');
	var formData = new FormData();
	formData.append('file', file);
	formData.append('windowId', windowId);
	xhr.send(formData);
}

var userPool = new AmazonCognitoIdentity.CognitoUserPool({
	UserPoolId: 'COGNITO_POOL', // 'COGNITO_POOL' und 'COGNITO_CLIENT'
	ClientId: 'COGNITO_CLIENT' // werden durch das www script ersetzt
});
	
function login() {
	var username = document.getElementById("login_username").value;
	var password = document.getElementById("login_password").value;
	var authenticationData = {
		Username: username,
		Password: password,
	};
	var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var userData = {
		Username: username,
		Pool: userPool
	};
	var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
	cognitoUser.authenticateUser(authenticationDetails, {
		onSuccess: function (result) {
			var accessToken = result.getAccessToken().getJwtToken();
			console.log(accessToken);
			document.cookie = "token=" + accessToken; 
		},
		onFailure: function(err) {
			alert(err.message || JSON.stringify(err));
		}
	});
}

function register() {
	var username = document.getElementById("register_username").value;
	var password = document.getElementById("register_password").value;
	var password_repeat = document.getElementById("register_password_repeat").value;
	var email = document.getElementById("register_email").value;
	var email_repeat = document.getElementById("register_email_repeat").value;
	if(email.localeCompare(email_repeat) == 0 && password.localeCompare(password_repeat) == 0) {
		var dataEmail = {
			Name: 'email',
			Value: email
		};
		var attributeList = [new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail)];
		userPool.signUp(username, password, attributeList, null, function(err, result){
			if (err) {
				alert("err: ", err.message || JSON.stringify(err));
				return;
			}
			var cognitoUser = result.user;
			console.log('user name is ' + cognitoUser.getUsername());
		}); 
	} else {
		alert("repeat of password/email incorrect");
	}
}

function confirm() {
	var username = document.getElementById("confirm_username").value;
	var code = document.getElementById("confirm_code").value;
	var userData = {
		Username: username,
		Pool: userPool
	};
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }
        console.log('call result: ' + result);
    });
}
