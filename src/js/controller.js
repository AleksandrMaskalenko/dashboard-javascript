angular.module('myApp', ['chart.js', 'anguFixedHeaderTable'])

.controller('Controller', function ($scope) {


    let labels = ["started", "success", "error", "failure"];

    $scope.eventLabels = labels;

    let allEventArray = [];

    
    let socket = io('http://testevents.neueda.lv:80', {
        path: '/live'
    });

    socket.on('test', function(data) {

        allEvent(data);
        getLimit(data);
        getAllLabels(data);
        getEventData();
        getComponentData();
        getRequirementData();
        getLineChartData(data);
    });


    let endLimit;
    let limit = 300000;

    function allEvent(data) {
        allEventArray.push(data);
        $scope.events = allEventArray;
        $scope.totalEventCount = allEventArray.length;

    }

    function getLimit(data) {
        endLimit = Date.parse(data.time) - limit;
    }

    let componentLabelsSet = new Set();
    let requirementLabelsSet = new Set();


    function getAllLabels(data) {
        componentLabelsSet.add(data.testCase.component);
        requirementLabelsSet.add(data.testCase.requirement);

        $scope.componentLabel = [...componentLabelsSet];
        $scope.requirementLabel = [...requirementLabelsSet];
        if (millisecondsArray[0] === undefined) {
            getLabelsLineChart(data);
        }
        $scope.$apply();
    }

    function getEventData() {

        let dataArray = [0, 0, 0, 0];

        allEventArray.forEach(function (eve) {
            if(Date.parse(eve.time) >= endLimit) {

                for (let i = 0; i < labels.length; i++) {
                    if (eve.event === labels[i]) {
                        dataArray[i]++;
                    }
                }
            }
        });

        $scope.EventCountLimited = dataArray.reduce((a, b) => a + b, 0);
        $scope.eventData = dataArray;

        $scope.$apply();
        
    }

    function getComponentData() {
        let componentDataArray = [];

        [...componentLabelsSet].forEach(function (component) {
            let count = 0;

            allEventArray.forEach(function(event) {
                if(event.testCase.component === component) {
                    count++;
                }
            });
            componentDataArray.push(count);
        });

        $scope.componentData = [componentDataArray];
        $scope.$apply();
        
    }

    function getRequirementData() {
        let requirementDataArray = [[], [], [], []];

        [...requirementLabelsSet].forEach(function (req) {
            for (let i = 0; i < labels.length; i++) {
                let filteredArray = allEventArray
                    .filter((el) => el.testCase.requirement === req)
                    .filter((el2) => el2.event === labels[i]);
                requirementDataArray[i].push(filteredArray.length);
            }
        });

        $scope.requirementData = requirementDataArray;
        $scope.$apply();
    }

    let arrayLabelsTime = [];
    let millisecondsArray = [];

    let countStep = 20;
    
    function getLabelsLineChart(data) {
        let time = Date.parse(data.time);
        let sec = new Date(time).getSeconds();

            if (sec > 30) {
                millisecondsArray.push(time + (60 - sec) * 1000);
            } else {
                millisecondsArray.push(time + (30 - sec) * 1000);
            }

            for (let i = 0; i < countStep - 1; i++) {
                millisecondsArray.push(millisecondsArray[i] + 30000);
            }

            millisecondsArray.forEach(function(elem) {
                let str = dateFormat(new Date(elem), "h:MM:ss");
                arrayLabelsTime.push(str);
            });

        $scope.labelsLineChart = arrayLabelsTime;
        $scope.$apply();
    }


    function updateMillisecondsArray() {
        arrayLabelsTime.shift();
        millisecondsArray.shift();
        millisecondsArray.push(millisecondsArray[countStep - 2] + 30000);

        let str = dateFormat(new Date(millisecondsArray[countStep - 1]), "h:MM:ss");
        arrayLabelsTime.push(str);

        $scope.labelsLineChart = arrayLabelsTime;
        $scope.$apply();
    }


    let lineChartData = [[], [], [], []];

    function getLineChartData(data) {
        let allTypeLine = [[], [], [], []];

        let objectSec = Date.parse(data.time);

        let labelsLimit = 0;

        if ((lineChartData[0].length === countStep) && (millisecondsArray[countStep - 1] + 30000 < objectSec)) {
            for (let i = 0; i < lineChartData.length; i++) {
                lineChartData[i].shift();
            }
            updateMillisecondsArray();
            labelsLimit = millisecondsArray[0] - 30000;
        }

        let size = lineChartData[0].length;

        if(millisecondsArray[size] < objectSec) {

            for (let j = 0; j < size + 1; j++) {
                for (let i = 0; i < labels.length; i++) {
                    let filteredArray = allEventArray
                        .filter((el) => (Date.parse(el.time) < millisecondsArray[j]) && (Date.parse(el.time) > labelsLimit))
                        .filter((el) => el.event === labels[i]);

                    allTypeLine[i].push(filteredArray.length);
                }
                labelsLimit = millisecondsArray[j];
            }

            lineChartData = allTypeLine;

            $scope.dataLineChart = lineChartData;
            $scope.$apply();

        }
    }

    $scope.dataLineChart = lineChartData;


    $(document).ready(function() {
        $('select').material_select();
    });

    $('#limit').change(function(){
        limit = $(this).val();
    });

    $('#type').change(function(){
        let newArray = [[0], [0], [0], [0]];
        let value = $(this).val();

        if(value === 4) {
            $scope.dataLineChart = lineChartData;
            $scope.$apply();
        } else {
            let ar = lineChartData[value];
            newArray.splice(value, 1, ar);
            $scope.dataLineChart = newArray;
            $scope.$apply();
        }
    });

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