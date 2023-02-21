ruledetails=
{
	displayNoSelection: function()
	{
		$("#ruledetails").html("<h1>No Rule Selected</h1>");
	},
	displayRule: function(ruleId)
	{
		console.log("should display rule from: "+ruleId);

		$.ajax({
			type: 'GET',
			url: constants.rootUrl + "quality-rules/"+ruleId,
			success: function (result) {

				console.log(result);

				/* 					<h5 class="card-title">

					</h5>
*/
				listAllItems = "<h4>"+result["name"]+"</h4>";


				listAllItems = listAllItems + "<b>Rationale</b>";
				listAllItems = listAllItems + "<p>"+result["rationale"]+"</p>";

				listAllItems = listAllItems + "<p>Technologies</p>";
				listAllItems = listAllItems + "<ul>";

				result["technologies"].forEach(element => {
					listAllItems = listAllItems+"<li>"+element['name']+"</li>";
				});

				listAllItems = listAllItems + "</ul>";

				/* If you are logged in */
				listAllItems = listAllItems+"<p>"+result["description"]+"</p>";

				/*result["items"].forEach(element => {

					var finalName = element["displayName"];

					if(!finalName)
					{
						tmpName = element["name"];
						finalName = tmpName.charAt(0).toUpperCase()+tmpName.slice(1);
					}

					listAllItems = listAllItems + '<li class="nav-item"><a class="nav-link" aria-current="page" href="#" sourceid="'+element["name"]+'" sourcehref="'+element["href"]+'"><img src="'+element["iconUrl"]+'" class="mainfeather"/><span class="align-text-bottom"></span>'+finalName+'</a></li>';
				});*/

				$("#ruledetails").html(listAllItems);
			},
			error: function (xhr, status) { $('#result').addClass("alert-danger").removeClass("alert-success").text("request error to get the types"); }
		});
	},
};