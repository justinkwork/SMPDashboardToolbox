//sql countToGrid widget
function countToGrid() {
	var countElement = $('.countToGrid');
	var readCount = 0;
	
	function IsJsonString(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}
	function buildCount(widget) {
		console.log('buildCount');
		if (IsJsonString(widget.text())) {
			var gDef = JSON.parse(widget.text());
			widget.hide();
			
			var wrapper = widget.parent().find('.countWrapper');
			if (wrapper.length < 1){
				widget.parent().append('<div class="countWrapper"></div>');
				wrapper = widget.parent().find('.countWrapper');
				readCount = 0;
			}
			else {
				wrapper.remove();
				widget.parent().append('<div class="countWrapper"></div>');
				wrapper = widget.parent().find('.countWrapper');
				readCount = 0;
			}
			
			function retCol(cols) {
				var r = [];
				cols.forEach( function(e) {
					r.push(
					{
						field: e,
						title: e
					}
					)
				});
				return r;
			}; 
			
			function showCount(d) {
				var color = "black";
				if (gDef.gtThreshold && gDef.gtColor) {
					if (d.length > gDef.gtThreshold) {
						gtColor = gDef.gtColor;
					}
				}
				if (gDef.ltThreshold && gDef.ltColor) {
					if (d.length < gDef.ltThreshold) {
						ltColor = gDef.ltColor;
					}
				}
				if (gDef.gtThreshold && gDef.ltThreshold) {
					if (gDef.ltThreshold < gDef.gtThreshold) {
						color = gtColor;
					}
					else {
						color = ltColor;
					}
				}
				else {
					if (gDef.ltColor) {
						color = ltColor;
					}
					else if (gDef.gtColor) {
						color = gtColor;
					}
				}
				
				wrapper.append('<h2 id=' + gDef.dash1 + ' style="font-size:5em;cursor:pointer;color:' + color + ';margin:-2px;text-align:center;">' + d.length + '</h2>');
				$('#' + gDef.dash1).bind('click', function(){
					buildGrid(wrapper, datasource)
				});
			} 
			
			var datasource = new kendo.data.SchedulerDataSource({
				transport: {
					read: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + gDef.dash1
				},
				pageSize: 5,
				serverPaging: false,
				serverSorting: false,
				serverFiltering: false,
				requestEnd: function(data) {
					if (readCount == 0) {
						showCount(data.response);
						readCount++;
					}					
				}
			});
				
			function buildGrid(widget, ds) {
				widget.empty();
				var element = widget.kendoGrid({
					dataSource: ds,
					height: 300,
					sortable: true,
					selectable: true,
					groupable: true,
					pageable: {
						refresh: true,
						pageSizes: true,
						buttonCount: 5
					},
					filterable: true,
					columns: retCol(gDef.dash1Columns),
					change: clickThrough
				});
			}
			
			function clickThrough(e) {
				var row = $(e.sender.element).data('kendoGrid').select()
				var workItemID = row.children()[0].textContent
				$.get("/Search/GetSearchObjectByWorkItemID?searchText=" + workItemID, function(data) {
					window.open(data, '_blank');
				});
			};
			datasource.read();
		}
		else {
			console.log('countToGrid widget definition is invalid:');
			console.log(widget.text());
		}
	}
	var btnRefresh = '<i class="c2g fa fa-refresh" style="float:right;"></i>';
	if (countElement.length > 1) {
		$.each(countElement, function(i,e) {
			buildCount($(e));
			$(e).parent().parent().parent().parent().prev().children().children().append(btnRefresh);
		});
	}
	else {
		buildCount(countElement);
		$(countElement).parent().parent().parent().parent().prev().children().children().append(btnRefresh);
	}
	$('.c2g').on('click', function(e) {
		$(e.currentTarget).blur();
		var widg = $(e.currentTarget).parent().parent().parent().parent().find('.countToGrid');
		buildCount(widg);
	}); 
}

$(document).ready(function() {
	setTimeout(function(){countToGrid()}, 5000);
})