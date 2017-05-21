angular.module('myApp', ['chart.js', 'anguFixedHeaderTable'])

.controller('Controller', function ($scope) {
    
      $scope.min = function(min) {
          let ti = min;
      }
    
    $scope.eventLabels = ["started", "success", "error", "failure"];
    
    let allEventArray = [];
    
    var socket = io('http://testevents.neueda.lv:80', {
        path: '/live'
    });
    
    
    socket.on('test', function(data) {
        
        allEvent(data);
        event(); 
        component(data);
        requirement(data);     
     
    });
    
    
    let endTime;
    
    let allEvent = function(data) {
        allEventArray.push(data);
        $scope.events = allEventArray;
        $scope.totalEventCount = allEventArray.length;
        
        endTime = Date.parse(data.time) - 3600000;
        
    }
    
    
    let event = function() {
        
        let started = 0;
        let success = 0;
        let error = 0;
        let failure = 0;
        
        
        let eventLimitedArray = [];
        
        
        for(let eve of allEventArray) {
            let time = Date.parse(eve.time);
            if(time >= endTime) {
                eventLimitedArray.push(eve);
            }
        }
        
        $scope.EventCountLimited = eventLimitedArray.length;
        
        for(let ev of eventLimitedArray) {
        
            if(ev.event == "started") {
                started++;
            } else if(ev.event == "success") {
                success++;
            } else if (ev.event == "error") {
                error++;
            } else if (ev.event == "failure") {
                failure++;
            }
        
        }
        
        let dataArray = [started, success, error, failure];
        $scope.eventData = dataArray;
        $scope.$apply();
        
    };
    
    
    let componentSet = new Set();    
    
    let component = function(data) {
        let componentDataArray = [];
    
        componentSet.add(data.testCase.component);
        let componentLabelArray = [...componentSet];
        
        
        for(let lab of componentLabelArray) {
            var count = 0;
                      
            for(let eve of allEventArray) {
                if(eve.testCase.component == lab) {
                    count++;
                }
            }
        componentDataArray.push(count);
        } 
        
        $scope.componentLabel = componentLabelArray;
        $scope.componentData = [componentDataArray];
        
        $scope.$apply();
        
    }
    

    let requirementSet = new Set();
    
    
    let requirement = function(data) {
        
        
        
        requirementSet.add(data.testCase.requirement);
        let requirementLabelArray = [...requirementSet];
     
        let startedArray =[];
        let successArray =[];
        let errorArray =[];
        let failureArray =[];
        
        for(let req of requirementLabelArray) {
            let eventArray =[];
            for(let event of allEventArray) {
                if(event.testCase.requirement == req) {
                    eventArray.push(event);
                }
            }
            
            let started = 0;
            let success = 0;
            let error = 0;
            let failure = 0;
                   
            for(let event of eventArray) {
                
                    if(event.event == "started") {
                        started++;
                    } else if(event.event == "success") {
                        success++;
                    } else if (event.event == "error") {
                        error++;
                    } else if (event.event == "failure") {
                        failure++;
                    }
                    
            }
            
            startedArray.push(started);
            successArray.push(success);
            errorArray.push(error);
            failureArray.push(failure);
        } 
        
        let requirementDataArray = [startedArray, successArray, errorArray, failureArray];
        
        $scope.requirementLabel = requirementLabelArray;
        $scope.requirementData = requirementDataArray;
        $scope.$apply();
    }
    
        let minutesLabel = document.getElementById("minutes");
        let secondsLabel = document.getElementById("seconds");
        let totalSeconds = 0;
        setInterval(setTime, 1000);

        function setTime()
        {
            ++totalSeconds;
            secondsLabel.innerHTML = pad(totalSeconds%60);
            minutesLabel.innerHTML = pad(parseInt(totalSeconds/60));
        }

        function pad(val)
        {
            let valString = val + "";
            if(valString.length < 2)
            {
                return "0" + valString;
            }
            else
            {
                return valString;
            }
        }
    
});