# SMPDashboardToolbox
A set of custom widgets for use with dashboard pages in the Cireson Portal for Service Manager.

Usage:
These widgets are designed to be used with an HTML Widget from a Dashboard Page in the Cireson Portal and to populate data with an existing dashboard query.  The individual widget is called by having these scripts running in custom.js (preferably with the [loadScript](https://community.cireson.com/discussion/comment/14268#Comment_14268) function).  Each widget can be rendered as follows:

## Custom Scheduler (Calendar)
To add the custom scheduler, create a div in the HTML widget with the class name of customScheduler like this:
  `<div class="customScheduler"><div>`
 
 To populate data into the Scheduler, there needs to be a JSON definition.  
 Here are the properties that will need to be added to the JSON:
 + dash1 (**required**) - this is the query Id of the dashboard query that will serve as the data source for the scheduler.
 + Field (**required**) - this is that field that will be used to color and group the calendar events (note the capital "F".  Case is important)
 + IdField (**required**) - This is Id that will be used in the URL of the click-through link
 + TitleField (**required**) - This is the field that will be display as the title of the calendar event
 + startField (**required**) - This is the date field from the query results that will serve as the Start Date of the calendar event
 + endField (**required**) - This is the date field from the query results that will serve as the End Date of the calendar event (Note: I like to use an End Date of whatever date I'm trying to represent on the calendar +1 minute which yields a single blip on the calendar as opposed to a time span of potentially multiple days.  For example, if the WorkItem Created Date was the date I was wanting to show on my calendar I would have _Created_ as the startField and _end_ as endField where `dateadd(mi,1,Created) as 'end'` is one of the selected fields in my dashboard query)
 + workItem (_optional_) - If set to 'true', will assume that the calendar event represents a work item and will open that work item's form in a new tab.  If workItem is absent, the page that will be opened will be the DynamicData/Edit form + the Id that is defined in _IdField_(Note: this will fail if the Id is not a valid SCSM Object Guid).
 + customURL (_optional_) - If present, will open a new tab to the supplied url + the Id that is defined in _IdField_.  (Note: this is useful for pointing to AssetManagement pages inside the portal as opposed to not supplying the customURL and being directed to the DynamicData form for the Asset).
 + Legend (_optional_) - If set to 'true' and _colorValues_ are provided, will set the legend and the calendar entries according to the provided colors.  If set to 'true' and _colorValues_ are not provided, the legend will be present but use the default color scheme (which will rotate if there are more than 10 values in the selected _Field_).  If set to 'auto', the legend will be present and will use the default color scheme.
 + colorValues (_optional_) - an array of colors to be used for a given value of the selected _Field_.  If _Legend_ is present colorValues will supply the colors for the Legend.  If _Legend_ is **not** present, the supplied colors will be used, but any remaining undefined value will recieve the portal's default color.  
Suboptions for colorValues:
   * value - this is the value to be colored on in the calendar
   * color - the HTML color code of the color to be used for the specified value
   * url(_optional_) - if provided, will add an image with the supplied url as the source to the legend for the specified value

Here is an example of a custom scheduler definition:   
`<div class='customScheduler'>{  
	"dash1": "3dbcc15c-6377-6d3a-b66f-9cf9fa5c0e96",  
	"colorValues": [  
		{"value": "04b69835-6343-4de2-4b19-6be08c612989", "color": "#3bcf79"},  
  {"value": "e6c9cf6e-d7fe-1b5d-216c-c3f5d2c7670c", "color": "#2980b9","url":"/CustomSpace/customWidgets/cr.png"},
{"value": "7ac62bd4-8fce-a150-3b40-16a39a61383d", "color": "#f54287","url":"/CustomSpace/customWidgets/ma.png"} 
	],
	"Field": "ClassId",
	"IdField": "WorkItemId",
	"TitleField": "DisplayName",
	"startField": "ScheduledStartDate",
"Legend": "true",
	"endField": "ScheduledEndDate"
}</div>`

Screenshot: 
![alt text](https://raw.githubusercontent.com/justinkwork/SMPDashboardToolbox/master/screenshots/calSS.png "Calendar Screenshot")

## Hierarchy Grid
This is a grid used for aggregating data, but being able to expand the aggregated data and see the data underneath.  For example, if you wanted to know the number of work items in a given status you would have a query that counts and groups the work items by status.  But you might also like to see the work items in a given status.  Using the hierarchy widget, you have a query for the "grouped by status" query and a query that represents the work items themselves in each of the statuses.  Expanding the status in the top query, you can see the work items in that status in the same grid.

To add the hierarchy grid, create a div in the HTML widget with the class name of gridHierarchy like this:
  `<div class="gridHierarchy"><div>`
  
  To populate data into the Scheduler, there needs to be a JSON definition.  
 Here are the properties that will need to be added to the JSON:
+ dash1 (**required**) - this is the query id of the "top level" grid where the aggregation will be shown
+ dash2 (**required**) - this is the query id of the "data underneath" query where the data for a given row in the top level query comes from
+ link (**required**) - this is the field that will link the aggregated query to the data query.  In the above example, the Status field would be the link.  Both queries would need a status field and the field names would be case sensitve.  The link field will have to match the case of the field in both queries.
+ dash1Columns (**required**) - An array of (case sensitve) field names from the _dash1_ query.  It must contain the field specified as the _link_.
+ dash2Columns (**required**) - An array of (case sensitve) field names from the _dash2_ query.  It must contain the field specified as the _link_.

Here is an example of a Hierarchy Grid widget definition:   
`<div class='gridHierarchy' style='height: 450px;'>{"dash1":"e31fd4b0-6588-bed7-de1c-44315d006f37", 
"dash2":"b0c47cf0-8935-3667-e32e-941b15065d60",
"link":"Status",
"dash1Columns": ["Status", "WICount"],
"dash2Columns": ["WorkItemId", "Title", "Status", "AffectedUser"]
}</div>`

Screenshot: 
![alt text](https://raw.githubusercontent.com/justinkwork/SMPDashboardToolbox/master/screenshots/gridHierarchySS.png "Hierarchy Grid Screenshot")

## Count to Grid 
This is a widget that takes a dashboard query and displays the count of records but lets you click the count to see the underlying data that the count represents.

To add the Count to Grid widget, create a div in the HTML widget with the class name of countToGrid like this:
  `<div class="countToGrid"><div>`
 
 To populate data into the Scheduler, there needs to be a JSON definition.  
 Here are the properties that will need to be added to the JSON:
  + dash1 (**required**) - this is the query Id of the dashboard query that will serve as the data source
  + dash1Columns (**required**) - An array of (case sensitve) field names from the _dash1_ query that will be visible in the underlying grid.
  
  Here is an example of a Count to Grid widget definition:   
`<div class="countToGrid">{
"dash1":"665132ad-6dc0-cd05-b81a-97689753de17" ,
"dash1Columns": ["WorkItemId","Title","Status"]
}</div>`

Screenshot: 
![alt text](https://raw.githubusercontent.com/justinkwork/SMPDashboardToolbox/master/screenshots/CountToGrid.gif "Count to Grid Screenshot")
