var propertiesAge = {
    ages: [10, 20, 30, 40, 50, 60, 70,80]
};

function calcAgeHistogramData(data) {
  console.log("calcAgeHistogramData")
    maxAge = d3.max(propertiesAge.ages)
    function filter(x) {
        var newAge = x.age - (x.age % 10);
        newAge = newAge>maxAge? maxAge : newAge;
        return {
            age: newAge,
            population: x.population
        };
    }

    function filter2(array) {
        function redFunc(sum, obj) {
            return sum + obj.population;
        }
        return _.reduce(array, redFunc, 0);
    }


    var groupped = _.mapValues(_.groupBy(_.map(data, filter), 'age'), filter2);
    return groupped;
}

function createAge(dailyAvgData, addFilter, removeFilter) {
console.log("createAge")
    var parent = document.getElementById("age");
    containerWidth = parent.clientWidth;
    containerHeight = constants.componentHeight;

    var margin = {top: 20, right: 20, bottom: 35, left: 40},
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    
    var startDragX = null,
        endDragX = null,
        fromIdx = null,
        toIdx = null;
    
    var drag = d3.drag()
      .on("drag", dragged)
      .on("start", startDrag)
      .on("end", endDrag);
  
    var removeCurrentFilter = function () {
        if (propertiesAge.filterName) {
          // avoids infinite calls
          var toRemove = propertiesAge.filterName;
          propertiesAge.filterName = undefined;
          removeFilter(toRemove);
        }
        svg.selectAll(".bar").attr("opacity", 1);
    };
    
    function startDrag() {
        startDragX = d3.event.x;
        svg.selectAll(".bar").attr("opacity", 0.5);
    }
    
    function dragged() {
      endDragX = d3.event.x;
  
      var from = startDragX,
          to = endDragX;
        
        if (from > to) {
          var temp = from;
          from = to;
          to = temp;
        }
  
        fromIdx = Math.floor((from / x.step()));
        toIdx = Math.ceil((to / x.step()));

        svg.selectAll('.bar').attr('opacity', function (d) {
          var idx = propertiesAge.ages.findIndex(function (a) { return d.age == a; });
          return idx >= fromIdx && idx < toIdx ? 1 : 0.5;
        });
      }
    
      function endDrag() {
        dragged();

        if (propertiesAge.filterName) {
            removeCurrentFilter()
            if (Math.abs(endDragX - startDragX) < 5) {
                return;
            }
        }

        if (fromIdx <= 0 && toIdx >= propertiesAge.ages.length) {
            removeCurrentFilter();
            return;
        }

        // filter name
        if (fromIdx <= 0) {
            filterName = "Age < " + propertiesAge.ages[toIdx] + "y";
        } else if (toIdx >= propertiesAge.ages.length) {
            filterName = "Age >= " + propertiesAge.ages[fromIdx] + "y";
        } else {
            filterName = "Age " + propertiesAge.ages[fromIdx] + "y-" + propertiesAge.ages[toIdx] + "y";
        }
    
        propertiesAge.fromAge = fromIdx >= 0 ? propertiesAge.ages[fromIdx] : 0
        propertiesAge.toAge = toIdx < propertiesAge.ages.length ? propertiesAge.ages[toIdx] : 9999999999;
        var filterFunction = function (d) {
          return d.age >= propertiesAge.fromAge && d.age < propertiesAge.toAge;
        };
    
        propertiesAge.filterName = filterName;
        addFilter(filterName, filterFunction, removeCurrentFilter);
      }
  

    var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
    
    x.domain(propertiesAge.ages);

    var svg = d3.select("#age").append("svg") 
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

    
    // full clickable rect
    svg.append("g")
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")
    .call(drag);

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    
    // y axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "histogram-label")
        .attr("transform", "translate("+ -30 +","+(height/2)+")rotate(-90)")
        .text("population");
    
    // x axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "histogram-label")
        .attr("transform", "translate("+ (width/2) +","+(height + 30)+")")
        .text("age");

    propertiesAge.svg = svg;
    propertiesAge.height = height;
    propertiesAge.width = width;
    propertiesAge.x = x;
}

function updateAge(dailyAvgData, addFilter, removeFilter) {
console.log("updateAge")
    var svg = propertiesAge.svg;
    var height = propertiesAge.height;
    var width = propertiesAge.width;
    var x = propertiesAge.x;

    var histData = calcAgeHistogramData(dailyAvgData);
    
    var ages = Object.keys(histData);
    var pop = Object.values(histData);

    var newData = [];

    for(var i = 0; i < ages.length; ++i) {
         newData.push({
            age: ages[i],
            population: pop[i]
        });
    }

    var y = d3.scaleLinear()
    .range([height, 0]);

    y.domain([0, d3.max(newData, function(d) { return d.population; })]);


    // append the rectangles for the bar chart
    var bars = svg.selectAll(".bar")
      .data(newData, function (d) {return d.age;});
    

    bars.enter()
        .append("rect")
        .attr("fill", "#2c3e50")
        .attr("class", "bar pass-through")
        .attr("x", function(d) { return x(d.age); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.population); })
        .attr("height", function(d) { return height - y(d.population); })
    .merge(bars)
        .transition().duration(500)
        .attr("y", function(d) { return y(d.population); })
        .attr("height", function(d) { return height - y(d.population); });

    bars.exit().remove()

    svg.select(".y-axis").remove();

        
        // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y-axis");
}