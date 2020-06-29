$(function(){
    $("#scheduler").dxScheduler({
        dataSource: data,
        views: [{
            type: "week",
            dataCellTemplate: function(data, index, element){
               console.log(data);
              if(data.startDate.getDay() < 3 || data.endDate.getDay()< 3)
                 element.css("backgroundColor", "gray")
                return element;
                
            }
        }],
        currentView: "week",
        currentDate: new Date(2017, 4, 25),
        startDayHour: 9,
        height: 600
    });

    return (
    	
    	<div class="dx-viewport demo-container">
        	<div id="scheduler"></div>
    	</div>
    )
});