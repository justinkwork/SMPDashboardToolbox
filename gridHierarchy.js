//hierarchy grid widget
function gridHierarchy() {
	var gridElement = $('.gridHierarchy');
	
	function IsJsonString(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}
	
	function buildHierarchy(widget) {
		console.log('buildHierarchy');
		if (IsJsonString(widget.text())) {
			var gDef = JSON.parse(widget.text());
			widget.hide();
			
			var wrapper = widget.parent().find('.hierarchyWrapper');
			if (wrapper.length < 1){
				widget.parent().append('<div class="hierarchyWrapper"></div>');
				wrapper = widget.parent().find('.hierarchyWrapper');
			}
			else {
				wrapper.remove();
				widget.parent().append('<div class="hierarchyWrapper"></div>');
				wrapper = widget.parent().find('.hierarchyWrapper');
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
			var element = wrapper.kendoGrid({
				dataSource: {
					transport: {
						read: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + gDef.dash1
					},
					pageSize: 4,
					serverPaging: false,
					serverSorting: false,
					serverFiltering: false
				},
				height: 350,
				sortable: true,
				pageable: {
					refresh: true,
					pageSizes: true,
					buttonCount: 5
				},
				filterable: true,
				detailInit: detailInit,
				dataBound: function() {
					wrapper.css('height', '400px');
				},
				columns: retCol(gDef.dash1Columns)
			});
			
			function detailGridBound(e, link) {
				e.sender.dataSource.filter({ field: gDef.link, operator: "eq", value: link })
			}
			
			function detailInit(e) {
				var i = 0;
				var link = e.data[gDef.link];
				$("<div/>").appendTo(e.detailCell).kendoGrid({
					dataSource: {
						transport: {
						read: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + gDef.dash2
						},
						serverPaging: false,
						serverSorting: false,
						serverFiltering: false,
						pageSize: 5,
					},
					scrollable: false,
					selectable: true,
					sortable: true,
					pageable: {
						refresh: true,
						pageSizes: true,
						buttonCount: 5
					},
					columns: retCol(gDef.dash2Columns),
					change: clickThrough,
					dataBound: function(e) {
						if (i < 1){
							i++;
							detailGridBound(e, link);
						}
					}
				});
				
			};
			
			function clickThrough(e) {
				var row = $(e.sender.element).data('kendoGrid').select()
				var workItemID = row.children()[0].textContent
				$.get("/Search/GetSearchObjectByWorkItemID?searchText=" + workItemID, function(data) {
					window.open(data, '_blank');
				});
			};
		}
		else {
			console.log('gridHierarchy widget definition is invalid:');
			console.log(widget.text());
		}
	}
	
	var btnRefresh = '<i class="hg fa fa-refresh" style="float:right;"></i>';
	if (gridElement.length > 1) {
		$.each(gridElement, function(i,e) {
			buildHierarchy($(e));
			$(e).parent().parent().parent().parent().prev().children().children().append(btnRefresh);
		});
	}
	else {
		buildHierarchy(gridElement);
		$(gridElement).parent().parent().parent().parent().prev().children().children().append(btnRefresh);
	}
	$('.hg').on('click', function(e) {
		$(e.currentTarget).blur();
		var widget = $(e.currentTarget).parent().parent().parent().parent().find('.gridHierarchy');
		buildHierarchy(widget);
	}); 

}

$(document).ready(function() {
	setTimeout(function(){gridHierarchy()}, 5000);
})	