var $ = jQuery


/*
 * CONSTANTS
 */


var constants = {
  killedRadius: function (d) {
    return 3 + 4 * d.killed;
  },
  componentHeight: 300,
};

/*
 * DATA LOADING
 */

var dailyAvgIntakesData = null;

//$.getJSON('/data/accidents/accidents.json', function (data) {
$.getJSON('/data/daily_avg_data.json', function (data) {
    dailyAvgIntakesData = object2array(data);

    d3.select('#filters').append("dl");
    createComponents();
    updateComponents();
    updateFilterList();

    // to have intro, uncomment
    /*if (! readCookie('introDone')) {
        startTutorial();
    }*/
});

$(window).resize(function () {
    d3.selectAll('.dashboard-container svg').remove();
    globalFilters = [];
    selectedPoint = null;
    createComponents();
    updateComponents();
    updateFilterList();
});

/*
 * FILTERS SET UP
 */

var globalFilters = [];

function addFilter(name, lambda, removeMe) {
    globalFilters.push({
        'name': name,
        'lambda': lambda,
        'activated': true,
        'remove': removeMe
    });
    updateComponents();
    updateFilterList();
}

function removeFilter(name) {
    var removeAndKeep = _.partition(globalFilters, function (d) {
        return d.name === name
    })
    globalFilters = removeAndKeep[1]
    removeAndKeep[0].forEach(function (d) {
        d.remove()
    })

    updateComponents();
    updateFilterList();
}

function updateFilterList() {
    fs = globalFilters.length > 0 ? globalFilters : [{
        name: "Click & drag on any component..."
    }];
    var filterList = d3.select('#filters dl').selectAll("dd").data(fs, function (x) {
        return x.name;
    });

    var elem = filterList.enter().insert("dd")

    if (globalFilters.length > 0) {
        elem.insert('text').text('x\xa0\xa0')
            .attr('class', 'deleteFilterMark')
            .on('click', function (a) {
                if (a.name != 'Click & drag on any component...') {
                    removeFilter(a.name);
                }
            })
    }


    elem.insert('text').text(function (a) {
        return a.name;
    });

    filterList.exit().remove();
}

function filterData(data) {
    var filtered = data;
    globalFilters.forEach(function (aFilter) {
        filtered = filtered.filter(aFilter.lambda)
    });
    return filtered;
}

/*
 * COLOR SELECTION
 */

var selectedColor = 'danger';

function categoryColor(datum) {
    switch (selectedColor) {
        case 'danger':
            return dangerColor(datum['Danger level'])
        case 'activity':
            return activityColor(datum['Activity'])
    }
}

function updateCategorySelected(newCat) {
    d3.selectAll('.selectKeyPoint').classed('selected', false)
    d3.select('#' + newCat + 'Select').classed('selected', true)
    selectedColor = newCat;
    updateComponents();
}

function applyColor(data) {
    data.forEach(function (d) {
        d.color = categoryColor(d);
    })
    return data;
}

/*
 * COMPONENT INITIALISATION
 */

console.log("createComponents justbefpre")

function createComponents() {
    data = filterData(dailyAvgIntakesData);
    data = applyColor(data);
    createAge(data, addFilter, removeFilter);
    createBmi(data, addFilter, removeFilter);
    createRegions(data, addFilter, removeFilter);
    createTextual(data, addFilter, removeFilter);
    createNutrients(data, addFilter, removeFilter);
    console.log("createComponents")
}

console.log("createComponents DONE")

function updateComponents() {
    data = filterData(dailyAvgIntakesData);
    data = applyColor(data);

    console.log("XXXXXXXXXXXXXXXXXXXXX updateComponents(), nb datapoints: "+data.length+" XXXXXXXXXXXXXXXXXXXXX")
    updateAge(data, addFilter, removeFilter);
    updateBmi(data, addFilter, removeFilter);
    updateRegions(data, addFilter, removeFilter);
    updateTextual(data, addFilter, removeFilter);
    updateNutrients(data, addFilter, removeFilter);
    console.log("updateComponents")
}
console.log("updateComponents DONE")

// grouped bar chart: https://bl.ocks.org/mbostock/3887051
// stacked bar chart: https://bl.ocks.org/mbostock/3886208
// animated stacked bar chart: https://bl.ocks.org/mbostock/1283663
// bar chart with tooltip: http://bl.ocks.org/Caged/6476579

/*

Architecture:
===================

app.js:
- globalFilters: array of active filters
- addFilter & removeFilter: functions to add/remove a filter on the data
    -> also call the update functions
- updateFilterList: updates the html box listing the active filters
- filterData: apply all the filters to the data
- createComponents: initializes all the components
- updateComponents: updates all the components
    -> calls filterData


for each component:
- 1 createXXX function initializing the component
  - initialize the filtering functions for this component
    -> including handling of js events and links to addFilter & removeFilter
  - initialize the svg of the component and initial propertiesXX
- 1 updateXXX function doing the visual updates given the data
- 1 propertiesXXX variable containing the state

*/