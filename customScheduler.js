function customScheduler() {
	var scheduler = $(".customScheduler");

	function IsJsonString(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}
	var calStyle = "<style>.schedulerLegend {display: inline-block;width:100%}.legendEntry {display: inline-block;margin: 10px 10px 10px 10px;padding: 5px 20px 5px 5px;</style>";
	$('body').append(calStyle);
	function buildScheduler(widget) {
		if (IsJsonString(widget.text())) {
			var gDef = JSON.parse(widget.text());
			widget.hide();
			
			var wrapper = widget.parent().find('.schedulerWrapper');
			if (wrapper.length < 1){
				widget.parent().append('<div class="schedulerWrapper"></div>');
				wrapper = widget.parent().find('.schedulerWrapper');
			}
			else {
				wrapper.remove();
				widget.parent().append('<div class="schedulerWrapper"></div>');
				wrapper = widget.parent().find('.schedulerWrapper');
			}
			
			var url = "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + gDef.dash1;

			$.get(url, function(getResponse) {
				var readCount = 0;
				var ocols;
				var filter;
				var resource;
				var defaultColors = [
					"#DE0001",
					"#F56B39",
					"#FEDA15",
					"#1DC690",
					"#0086CB",
					"#2C46C4",
					"#603F8B",
					"#D234B0",
					"#C8651B",
					"#FBC00E",
					"#174507",
					"#073145",
					"#2c1994",
					"#590b78"
				];
				function addLegend(id, cols, field, widget, type) {
					var pic, chk;
					var scheduler = widget.data('kendoScheduler');
					widget.prepend('<div id="' + id + '" class="schedulerLegend"></div>');
					$.each(cols, function(i,e) {
						if (e.url) {
							pic = "<img height='64px' width='64px' src='" + e.url + "' style='padding-left: 10px;'>";
						}
						else {
							pic = "";
						}
						var chkValue = localStorage.getItem(id + ":" + e.value);
						if (chkValue == 'false') {
							chk = '';
						}
						else {
							chk = 'checked';
						}
						$('#' + id).append('<div class="legendEntry" style="background: ' + e.color + ';"><input class="legendCheck" ' + chk + ' type="checkbox" value="' + e.value + '" >' + e.value + pic + '</div>');
						

					})
					
					$('#' + id + ' :checkbox').change(function(e) {
						var checked = $.map($('#' + id + ' :checked'), function(checkbox) {
							return $(checkbox).val();
						})
						localStorage.setItem(id + ":" + $(this).val(), this.checked);
						var scheduler = widget.data('kendoScheduler');
						
						scheduler.dataSource.filter({
							operator: function(task) {
								return $.inArray(task[field], checked) >= 0;
							}
						});
					})
					
					var legendEntryCSS = {
						 "white-space" : "nowrap",
						 "border-radius": "25px",
						 "border": "solid 1px black",	
					}
					$('.legendEntry').css(legendEntryCSS);
					$('.legendCheck').css('width', '40px');
					$('.legendEntry').first().children().first().trigger('change');
				}
				
				function retCol(cols) {
					var r = [];
					cols.forEach( function(e) {
						r.push(
						{
							text: e.value,
							value: e.value,
							color: e.color
						}
						)
					});
					return r;
				};
				
				function buildFilters(cols, field) {
					var r = [];
					cols.forEach (function(e) {
						r.push({
							field: field,
							operator: "eq",
							value: e.value
						})
					})
					return r;
				}
				
				function scheduler_change(e) {
					if (e.events.length > 0) {
						if (gDef.workItem) {
							var workItemID = e.events[0].Id
							$.get("/Search/GetSearchObjectByWorkItemID?searchText=" + workItemID, function(data) {
								window.open(data, '_blank');
							});
						}
						else {
							if (!(gDef.customURL)) {
								window.open('/DynamicData/Edit/' + e.events[0].Id, '_blank');
							}
							else {
								window.open(gDef.customURL + e.events[0].Id, '_blank');
							}
						}
					}
						
				};
							
				function getFieldValues(f,d) {
					var r = [];
					d.forEach (function(e) {
						if (r.indexOf(e[f]) < 0) {
							r.push(e[f]);
						}
					});
					return r;
					
				};

				function databound(e) {
					$('.k-event').css('border-radius', '25px');
				};
				
				function buildColors(values, colors) {
					var c = [];
					var i = 0;
					
					values.forEach(function(e) {
						j = {
							value: e,
							color: colors[i]
						}
						i++;
						if ( i >= colors.length ) {
							i = 0;
						}
						c.push(j);
					});
					return c
				}
				
				function checkLegend(leg, data) {
					readCount++;
					if (leg) {
						if (leg == 'auto') {
							fieldValues = getFieldValues(gDef.Field, data);
							ocols = buildColors(fieldValues, defaultColors);
						}
						else {
							ocols = gDef.colorValues ? gDef.colorValues : buildColors(getFieldValues(gDef.Field,data), defaultColors);
						}
						addLegend(gDef.dash1, ocols, gDef.Field, wrapper, leg);
					} 
					else {
						ocols = gDef.colorValues
					}
				}
				
				var datasource = new kendo.data.SchedulerDataSource({
					transport: {
						read: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + gDef.dash1
					},
					schema: {
						model: {
							id: gDef.IdField,
							fields: {
								Id: { from: gDef.IdField },
								title: { from: gDef.TitleField },
								start: { type: "date", from: gDef.startField },
								end: { type: "date", from: gDef.endField },
								},
						}
					},
					requestEnd: function(data) {
						if (readCount == 0) {
							checkLegend(gDef.Legend, data.response);
						}
						
					}
				});
				
				function buildResources(field, data) {
					var r = [{
						field: field,
						title: field,
						dataSource: retCol(data)
					}];
					return r;
				}
				
				if (!(ocols)) {ocols = gDef.colorValues};
				var fieldValues = getFieldValues(gDef.Field, getResponse);
				var colors = buildColors(fieldValues, defaultColors);
				
				if (gDef.colorValues) {
					if (gDef.Legend == 'auto') {
						resource = buildResources(gDef.Field, colors);
						filter = buildFilters(colors, gDef.Field);
					}
					else {
						resource = buildResources(gDef.Field, ocols);
						filter = buildFilters(ocols, gDef.Field);
					}
				}
				else {
					resource = buildResources(gDef.Field, colors)
					filter = buildFilters(colors, gDef.Field)
				}

				wrapper.kendoScheduler({
					date: new Date(),
					toolbar: [ "pdf" ],
					views: [
						"day",
						{ type: "month", selected: true },
						"week",
						"agenda"
					],
					allDaySlot: true,
					editable: false,
					selectable: true,
					change: scheduler_change,
					dataBound: databound,
					dataSource: datasource,
					filter: {
						logic: "or",
						filters: filter
					},
					resources: resource
					
				});

			});
		}
		else {
			console.log('customScheduler widget definition is invalid');
		}
	}
	var btnRefresh = '<i class="cs fa fa-refresh" style="float:right;"></i>';
	if (scheduler.length > 1) {
		$.each(scheduler, function(i,e) {
			buildScheduler($(e));
			$(e).parent().parent().parent().parent().prev().children().children().append(btnRefresh);
		});
	}
	else {
		buildScheduler(scheduler);
		$(scheduler).parent().parent().parent().parent().prev().children().children().append(btnRefresh);
	}
	$('.cs').on('click', function(e) {
		$(e.currentTarget).blur();
		var widget = $(e.currentTarget).parent().parent().parent().parent().find('.customScheduler');
		buildScheduler(widget);
	}); 

		
}

$(document).ready(function() {
	setTimeout(function(){customScheduler()}, 5000);
})
