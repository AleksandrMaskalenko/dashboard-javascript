angular.module('myApp', ['chart.js', 'anguFixedHeaderTable'])

.controller('Controller', function ($scope) {
    
    let socket = io('http://testevents.neueda.lv:80', {
        path: '/live'
    });

    socket.on('test', function(data) {

        $scope.events = allEvent(data);
        $scope.totalEventCount = allEventArray.length;
        getLimit(data);
        getAllLabels(data);
        $scope.eventData = getEventData();
        $scope.componentData = getComponentData();
        $scope.requirementData = getRequirementData();
        $scope.dataLineChart = getLineChartData(data);
        $scope.$apply();
    });

    let labels = ["started", "success", "error", "failure"];

    $scope.eventLabels = labels;

    let allEventArray = [];

    function allEvent(data) {
        allEventArray.push(data);
        return allEventArray;
    }

    let endLimit;
    let limit = 300000;

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
        if (millisecondsArray.length === 0) {
            $scope.labelsLineChart = getLabelsLineChart(data);
        }
    }

    function getEventData() {

        let dataArray = [];

        for (let i = 0; i < labels.length; i++) {
            let filteredArray = allEventArray
                .filter((el) => Date.parse(el.time) >= endLimit)
                .filter((el) => el.event === labels[i])
                .length;

            dataArray.push(filteredArray);
        }

        $scope.EventCountLimited = dataArray.reduce((a, b) => a + b, 0);
        return dataArray;
    }

    function getComponentData() {
        let componentDataArray = [];

        [...componentLabelsSet].forEach(function (component) {
            let count = allEventArray
                .filter((el) => el.testCase.component === component)
                .length;
            componentDataArray.push(count);
        });

        return [componentDataArray];
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

         return requirementDataArray;
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

        return arrayLabelsTime;
    }


    function updateMillisecondsArray() {
        arrayLabelsTime.shift();
        millisecondsArray.shift();
        millisecondsArray.push(millisecondsArray[countStep - 2] + 30000);

        let str = dateFormat(new Date(millisecondsArray[countStep - 1]), "h:MM:ss");
        arrayLabelsTime.push(str);

        $scope.labelsLineChart = arrayLabelsTime;
    }


    let lineChartData = [[], [], [], []];
    let stepArray = [];

    function getLineChartData(data) {
        stepArray.push(data);

        let objectSec = Date.parse(data.time);

        if ((lineChartData[0].length === countStep) && (millisecondsArray[countStep - 1] + 30000 < objectSec)) {
            for (let i = 0; i < lineChartData.length; i++) {
                lineChartData[i].shift();
            }
            updateMillisecondsArray();
        }

        let size = lineChartData[0].length;

        if(millisecondsArray[size] < objectSec) {

            for (let i = 0; i < labels.length; i++) {
                let filteredArray = stepArray
                    .filter((el) => el.event === labels[i]);

                lineChartData[i].push(filteredArray.length);
            }
            stepArray = [];
        }

        return lineChartData;
    }

    $(document).ready(function() {
        $('select').material_select();
    });

    $('#limit').change(function(){
        limit = $(this).val();
    });

    $('#type').change(function(){
        let newArray = [[0], [0], [0], [0]];
        let value = $(this).val();

        if(value == 4) {
            $scope.dataLineChart = lineChartData;
            $scope.$apply();
        } else {
            let ar = lineChartData[value];
            newArray.splice(value, 1, ar);
            $scope.dataLineChart = newArray;
            $scope.$apply();
        }
    });

    let totalSeconds = 0;
    setInterval(setTime, 1000);

    function setTime() {
        ++totalSeconds;
        $scope.seconds = pad(totalSeconds%60);
        $scope.minutes = pad(parseInt(totalSeconds/60));
        $scope.hours = pad(parseInt(totalSeconds/3600));
        $scope.$apply();
    }

    function pad(val) {
        let valString = val + "";
        if(valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }
});