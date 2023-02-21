rulelist=
{
	rulecount: 0,

	/* Show/Hide rules deprecated */
	filterDeprecatedActivated: function(event) {
		if(constants.filterdeprecated) {
			constants.filterdeprecated = false;
			$(this).text("Hide Deprecated");
		}
		else {
			constants.filterdeprecated = true;
			$(this).text("Show Deprecated");
		}

		rulelist.filterRules();
	},

	/* Show/Hide rules with medium severity */
	filterMediumActivated: function(event) {
		if(constants.filtermedium) {
			constants.filtermedium = false;
			$(this).text("Hide Medium");
		}
		else {
			constants.filtermedium = true;
			$(this).text("Show Medium");
		}

		rulelist.filterRules();
	},

	/* Show/Hide rules with high severity */
	filterHighActivated: function(event) {
		if(constants.filterhigh) {
			constants.filterhigh = false;
			$(this).text("Hide High");
		}
		else {
			constants.filterhigh = true;
			$(this).text("Show High");
		}

		rulelist.filterRules();
	},

	/* Show/Hide rules with critical severity */
	filterCriticalActivated: function(event) {
		if(constants.filtercritical) {
			constants.filtercritical = false;
			$(this).text("Hide Critical");
		}
		else {
			constants.filtercritical = true;
			$(this).text("Show Critical");
		}

		rulelist.filterRules();
	},

	displayRules: function(rulesUrl)
	{
		console.log("displayRules");

		$.ajax({
			type: 'GET',
			url: constants.rootUrl + rulesUrl,
			success: function (result) {

				var allrules = result["qualityRules"];
				var alltemplates = result["qualityTemplates"];
				var allitems = [];

				/* Update the title displaying the number of rules + templates */
				var total = 0;
				
				if(allrules) {
					total = total + parseInt(allrules.length);
					allitems = allitems.concat(allrules);
				}

				if(alltemplates) {
					total = total + parseInt(alltemplates.length);
					allitems = allitems.concat(alltemplates);
				}

				rulelist.rulecount = total;

				/* Display the list of rules */
				rulelisthtml = "";

				allitems.forEach( element => {

					var elementName = element["name"];
					var trClass = "tablerow";
					var tdClass = "";

					if(elementName.startsWith("DEPRECATED:")){
						trClass = trClass + " table-secondary deprecated";
						tdClass = "text-secondary"
					}

					rulelisthtml = rulelisthtml+"<tr ruleId='"+element["id"]+"' class='"+trClass+"' severity='"+element["severity"]+"'>";
					rulelisthtml = rulelisthtml+"<td class='"+tdClass+"'>"+element["id"]+"</td>";

					if(element['isTemplate']==true) {
						tdNameClass = "isTemplate";
					}
					else {
						tdNameClass = "";
					}

					rulelisthtml = rulelisthtml+"<td class='"+tdClass+" "+tdNameClass+"'>"+element["name"]+"</td>";


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

				rulelist.filterRules();
				ruledetails.displayNoSelection();

			},
			error: function (xhr, status) { $('#result').addClass("alert-danger").removeClass("alert-success").text("request error to get the types"); }
		});
	},

	filterRules: function()
	{
		console.log("filterRules");

		/* Show all tr first */
		$("#rulelist").find('tr').show();

		if(constants.filterdeprecated == true) {
			$("#rulelist").find('tr.deprecated').hide();
		}

		if(constants.filtermedium == true) {
			$("#rulelist").find('tr[severity="10"]').hide();
		}

		if(constants.filterhigh == true) {
			$("#rulelist").find('tr[severity="20"]').hide();
		}

		if(constants.filtercritical == true) {
			$("#rulelist").find('tr[severity="30"]').hide();
		}

		const alltrhidden =  $("#rulelist").find("tr:hidden");
		const totalhidden = alltrhidden.length;

		if(totalhidden > 0) {

			if(rulelist.rulecount == 0) {
				$("#rulestitle").text("No Rule");
			}
			else if(rulelist.rulecount == 1) {
				$("#rulestitle").text("0/1 Rule");
			}
			else {
				var totalvisible = rulelist.rulecount - totalhidden;
				$("#rulestitle").text(totalvisible+" of "+rulelist.rulecount+" Rules");
			}	
		}
		else {

			if(rulelist.rulecount == 0) {
				$("#rulestitle").text("No Rule");
			}
			else if(rulelist.rulecount == 1) {
				$("#rulestitle").text("1 Rule");
			}
			else {
				$("#rulestitle").text(rulelist.rulecount+" Rules");
			}	
		}

		if($(alltrhidden).hasClass('table-primary') == true)
		{
			$(alltrhidden).removeClass("table-primary");
			ruledetails.displayNoSelection();
		}
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