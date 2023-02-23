user = {
    isAuthenticated: false,
    jwt: "",
    iconUrl: "",
    fullname: "",
    bearer: "",

    displayWidget: function(event) {
        $("#loginaction").hide();

        if(user.isAuthenticated) {
            $("#useraction").show();
        }
    },

    hideWidget: function(event) {
        $("#loginaction").show();
        $("#useraction").hide();
    }
}