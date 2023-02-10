rulelist=
{
	displayRules: function(rulesUrl)
	{
		console.log("displayRules");

		$.ajax({
			type: 'GET',
			url: constants.rootUrl + rulesUrl,
			success: function (result) {

				var allrules = result["qualityRules"];
				var alltemplates = result["qualityTemplates"];

				/* Update the title displaying the number of rules + templates */
				var total = 0;
				
				if(allrules) {
					total = total + parseInt(alltemplates.length);
				}

				if(alltemplates) {
					total = total + parseInt(allrules.length);
				}

				if(total == 0) {
					$("#rulestitle").text("No Rule");
				}
				else if(total == 1) {
					$("#rulestitle").text("1 Rule");
				}
				else {
					$("#rulestitle").text(total+" Rules");
				}

				/* Display the list of rules */
				rulelisthtml = "";

				result["qualityRules"].forEach( element => {

					var elementName = element["name"];
					var trClass = "tablerow";

					if(elementName.startsWith("DEPRECATED:")){
						trClass = trClass + " table-secondary deprecated";
					}

					rulelisthtml = rulelisthtml+"<tr ruleId='"+element["id"]+"' class='"+trClass+"'>";
					rulelisthtml = rulelisthtml+"<td>"+element["id"]+"</td>";

					if(element['isTemplate']==true) {
						tdNameClass = "isTemplate";
					}
					else {
						tdNameClass = "";
					}

					rulelisthtml = rulelisthtml+"<td class='"+tdNameClass+"'>"+element["name"]+"</td>";


					switch (element["severity"]) {
						case 30:
							rulelisthtml = rulelisthtml+"<td><span class='badge bg-danger text-light'>Critical</span></td>";
							break;
						case 20:
							rulelisthtml = rulelisthtml+"<td><span class='badge bg-warning text-dark'>High</span></td>";
							break;
						default:
							rulelisthtml = rulelisthtml+"<td><span class='badge bg-primary text-light'>Medium</span></td>";
							break;
					}
					rulelisthtml = rulelisthtml+"</tr>";
				});

				$("#rulelist").find("tbody").html(rulelisthtml);

				/* Click on the row to display the details */
				var alltrs = $("#rulelist").find('tr');
				alltrs.off("click");
				alltrs.on("click",rulelist.itemClicked);

			},
			error: function (xhr, status) { $('#result').addClass("alert-danger").removeClass("alert-success").text("request error to get the types"); }
		});
	},

	itemClicked: function(event)
	{
		var clickedelement = $(this);

		console.log("item clicked "+clickedelement.attr("ruleId"));

		$("#rulelist").find('tr').removeClass("table-primary");	
		clickedelement.addClass("table-primary");

		ruledetails.displayRule($(clickedelement).attr("ruleId"));
	},
};