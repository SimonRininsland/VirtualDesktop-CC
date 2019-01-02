var userPool = new AmazonCognitoIdentity.CognitoUserPool({
	UserPoolId: 'COGNITO_POOL', // 'COGNITO-POOL' und 'COGNITO-CLIENT' (- ist _)! 
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