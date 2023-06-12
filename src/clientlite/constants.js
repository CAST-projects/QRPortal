constants=
{
	rootUrl: "api/",
	originUrl: "",
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
	getIconHTML: function(iconName) {
		return '<svg class="icon icon-'+iconName+' feather"><use xlink:href="#icon-'+iconName+'"></use></svg>';
	},
	getImgFromSource: function(iconUrl) {
		return '<img src="'+iconUrl+'" class="feather"/>';
	},
	getMainIconHTML: function(iconName) {
		return '<svg class="icon icon-'+iconName+' mainfeather"><use xlink:href="#icon-'+iconName+'"></use></svg>';
	},
	getExpandableIconHTML: function() {
		return 	'<svg id="nodesymbol" class="chevron-right" width="16" height="16"><use xlink:href="#chevron-right"/></svg>';
	},
	getLeafDisabledHTML: function(imageElement,elementName) {
		return '<li class="nav-item text-secondary node-leaf">'+imageElement+'<span class="align-text-bottom"></span>'+elementName+'</li>'
	},
	getLeafEnabledHTML: function(imageElement,elementName,finalName,elementHref,descriptionElement) {
		return '<li class="nav-item node-leaf empty"><a class="nav-link" title="'+descriptionElement+'" aria-current="page" href="#" sourceid="'+elementName+'" sourcehref="'+elementHref+'">'+imageElement+'<span class="align-text-bottom"></span>'+finalName+'</a></li>'
	},
	getExpandableHTML: function(elementImage,elementName,finalName,elementHref,elementDescription) {
		return '<li class="nav-item node-expandable collapsed empty"><a class="nav-link" title="'+elementDescription+'" aria-current="page" href="#" sourceid="'+elementName+'" sourcehref="'+elementHref+'">'+elementImage+'<span class="align-text-bottom"></span>'+finalName+'</a></li>';
	},
	getSourceExpandableHTML: function(elementImage,elementName,finalName,elementHref,elementDescription) {
		return '<li class="nav-item node-expandable source collapsed empty"><a class="nav-link" title="'+elementDescription+'" aria-current="page" href="#" sourceid="'+elementName+'" sourcehref="'+elementHref+'">'+elementImage+'<span class="align-text-bottom"></span>'+finalName+'</a></li>';
	},
};