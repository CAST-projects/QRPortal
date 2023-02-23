extendlogin=
{
	authenticating: false,
	initialize: function()
	{
	},

	loginRequested: function(event)
	{
		if(extendlogin.authenticating == false) {

			$(this).attr("disabled","disabled");
			const validationIsOK = true;

			const uidInput = $("#loginFormControlInput").val();
			if(uidInput=="") {
				$("#loginFormControlInput").addClass('is-invalid').siblings(".invalid-feedback").text("Please, enter your CAST Extend account (email address).");
				validationIsOK = false;
				$("#loginaction").removeAttr("disabled");
			}
	
			const pwdInput = $("#pwdFormControlInput").val();
			if(pwdInput=="") {
				$("#pwdFormControlInput").addClass('is-invalid').siblings(".invalid-feedback").text("Please, enter your CAST Extend password.");
				validationIsOK = false;
				$("#loginaction").removeAttr("disabled");
			}

			if(validationIsOK) {
				extendlogin.authenticating = true;

				$.ajax({
					type: 'POST',
					url: constants.rootUrl + "sso/authenticate",
					data: JSON.stringify({"uid":uidInput,"pwd":pwdInput}),
					contentType: "application/json",
					success: function (result) {

						console.log(result);
		
						extendlogin.authenticating = false;

						user.fullname = result["fullname"];
						user.iconUrl = result["iconUrl"];
						user.jwt = result["jwt"];
						user.bearer = "Bearer "+result["jwt"];
						user.isAuthenticated = true;
						user.displayWidget();

						$("#loginclose").click();
					},
					error: function (xhr, status) {

						console.log("error:"+status);
						console.log("xhr:"+xhr);

						user.isAuthenticated = false;

						extendlogin.authenticating = false;
						$("#loginaction").removeAttr("disabled");
					}
				});	
			}
		}
	},


};