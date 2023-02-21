extendlogin=
{
	initialize: function()
	{
	},

	requestLogin: function()
	{
		$.ajax({
			type: 'GET',
			url: constants.rootUrl + originUrl,
			success: function (result) {

				listAllItems = "";

				result["items"].forEach(element => {

					var finalName = element["displayName"];

					if(!finalName)
					{
						tmpName = element["name"];
						finalName = tmpName.charAt(0).toUpperCase()+tmpName.slice(1);
					}

					listAllItems = listAllItems + '<li class="nav-item"><a class="nav-link" aria-current="page" href="#" sourceid="'+element["name"]+'" sourcehref="'+element["href"]+'"><img src="'+element["iconUrl"]+'" class="mainfeather"/><span class="align-text-bottom"></span>'+finalName+'</a></li>';
				});

				$("#sourcetree").html(listAllItems);

				$("#sourcetree").find("a.nav-link").on("click",sourcetree.itemClicked);
			},
			error: function (xhr, status) { $('#result').addClass("alert-danger").removeClass("alert-success").text("request error to get the types"); }
		});
	},

	itemClicked: function(event)
	{
		var clickedelement = $(this);

		if($(clickedelement).parent().hasClass("expanded")) {

			/* Just collapse by hidding the children */
			console.log("need to collapse ");

			console.log("children:"+clickedelement.parent().find("ul"));

			clickedelement.parent().find("ul").hide();
			clickedelement.parent().removeClass("expanded");

			var allNewLinks = $("#sourcetree").find("a.nav-link");

			allNewLinks.removeClass("active").removeClass("text-white");
		}
		else {
			/* We should get the children if not already loaded */
			
			$.ajax({
				type: 'GET',
				url: constants.rootUrl + $(clickedelement).attr("sourcehref"),
				success: function (result) {
	
					console.log(result);

					if(result["count"] || result["qualityRules"] || result["qualityTemplates"])
					{
						/* End of the leaf, we must display the rules */
						console.log("display the rules...");
						rulelist.displayRules($(clickedelement).attr("sourcehref"));

					}
					else {

						/* source tree has new children to be displayed */

						listAllItems = "<ul>";
	
						result["items"].forEach(element => {

							var finalName = element["displayName"];

							if(typeof finalName === "undefined")
							{
								//console.log(finalName);

								try {
									tmpName = element["title"];

									finalName = tmpName.charAt(0).toUpperCase()+tmpName.slice(1);
								} catch (error) {
									tmpName = element["name"];

									finalName = tmpName.charAt(0).toUpperCase()+tmpName.slice(1);
								}
							}

							/*console.log("leaf element:");
							console.log(element);*/

							/* Check if we have an iconUrl  to be displayed */
							var imageElement = "";

							if(element["iconUrl"]) {
								imageElement = '<img src="'+element["iconUrl"]+'" class="feather"/>';
							}

							listAllItems = listAllItems + '<li class="nav-item"><a class="nav-link" aria-current="page" href="#" sourceid="'+element["name"]+'" sourcehref="'+element["href"]+'">'+imageElement+'<span class="align-text-bottom"></span>'+finalName+'</a></li>';

							if(element["count"] == 0)
							{
								listAllItems = listAllItems + '<li class="nav-item">'+imageElement+'<span class="align-text-bottom"></span>'+finalName+'</li>';
							}
							if(element["qualityModel"]==true){

							}
		
						});
	
						listAllItems = listAllItems + "</ul>";
	
						$(clickedelement).parent().append(listAllItems);
						$(clickedelement).parent().addClass("expanded")
					}

					/* Variable should be set here to get all created items */
					var allNewLinks = $("#sourcetree").find("a.nav-link");
	
					/* clean all a nav-links and especially the click to avoid multiple events */
					allNewLinks.removeClass("active",200,"swing").removeClass("text-white",200,"swing");	
					allNewLinks.off("click");
					allNewLinks.on("click",sourcetree.itemClicked);

					/* active the latest selected a nav-link */
					$(clickedelement).addClass("active").addClass("text-white").find("img").addClass("featherselected");
				},
				error: function (xhr, status) { $('#result').addClass("alert-danger").removeClass("alert-success").text("request error to get the types"); }
			});
		}
	},
};