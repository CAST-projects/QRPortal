constants=
{
	rootUrl: "http://localhost:8080/api/",
	availableIconIds: [],
	filtermedium: false,
	filterhigh: false,
	filtercritical: false,
	filterdeprecated: true,
	getIconName: function(iconUrlStr) {

		if(iconUrlStr) {
			var allIconUrlStr = iconUrlStr.split("/");
			var lastIconStr = allIconUrlStr[allIconUrlStr.length-1]; // split and get the last word
			lastIconStr = lastIconStr.substring(0,lastIconStr.length-4); // remove .svg
	
			if(constants.availableIconIds.indexOf(lastIconStr) != -1)
			{
				return lastIconStr;
			}	
		}

		return "placeholder";
	},
};