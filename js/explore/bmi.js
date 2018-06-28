var propertiesBmi = {
    bmis: [12,15,18,21,24,27,30,33,36],
};

function calcBmiHistogramData(data) {
console.log("calcBmiHistogramData")
    maxBmi = d3.max(propertiesBmi.bmis)
    function filter(x) {
        var newBmi = x.bmi - (x.bmi % 3);
        newBmi = newBmi>maxBmi? maxBmi : newBmi;
        return {
            bmi: newBmi,
            population: x.population
        };
    }

    function filter2(array) {
        function redFunc(sum, obj) {
            return sum + obj.population;
        }
        return _.reduce(array, redFunc, 0);
    }


    var groupped = _.mapValues(_.groupBy(_.map(data, filter), 'bmi'), filter2);

            return groupped;
}

function createBmi(dailyAvgData, addFilter, removeFilter) {
console.log("createBmi")
    var parent = document.getElementById("bmi");
    containerWidth = parent.clientWidth;
    containerHeight = constants.componentHeight;

    var margin = {top: 20, right: 20, bottom: 35, left: 40},
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    console.log("BMI containerWidth")
    console.log(containerWidth)
    
        var startDragX = null,
        endDragX = null,
        fromIdx = null,
        toIdx = null;
    
      var drag = d3.drag()
        .on("drag", dragged)
        .on("start", startDrag)
        .on("end", endDrag);
    
      var removeCurrentFilter = function () {
        if (propertiesBmi.filterName) {
          // avoids infinite calls
          var toRemove = propertiesBmi.filterName;
          propertiesBmi.filterName = undefined;
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
          var idx = propertiesBmi.bmis.findIndex(function (a) { return d.bmi == a; });
          return idx >= fromIdx && idx < toIdx ? 1 : 0.5;
        });
      }
    
      function endDrag() {
        dragged();

        if (propertiesBmi.filterName) {
            removeCurrentFilter()
            if (Math.abs(endDragX - startDragX) < 5) {
                return;
            }
        }

        if (fromIdx <= 0 && toIdx >= propertiesBmi.bmis.length) {
            removeCurrentFilter();
            return;
        }

        // filter name
        if (fromIdx <= 0) {
            filterName = "Bmi < " + propertiesBmi.bmis[toIdx] + "y";
        } else if (toIdx >= propertiesBmi.bmis.length) {
            filterName = "Bmi >= " + propertiesBmi.bmis[fromIdx] + "y";
        } else {
            filterName = "Bmi " + propertiesBmi.bmis[fromIdx] + "y-" + propertiesBmi.bmis[toIdx] + "y";
        }
    
        propertiesBmi.fromBmi = fromIdx >= 0 ? propertiesBmi.bmis[fromIdx] : 0
        propertiesBmi.toBmi = toIdx < propertiesBmi.bmis.length ? propertiesBmi.bmis[toIdx] : 9999999999;
        var filterFunction = function (d) {
          return d.bmi >= propertiesBmi.fromBmi && d.bmi < propertiesBmi.toBmi;
        };
    
        propertiesBmi.filterName = filterName;
        addFilter(filterName, filterFunction, removeCurrentFilter);
      }
  

    var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
    
    x.domain(propertiesBmi.bmis);

    var svg = d3.select("#bmi").append("svg") 
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
        .text("bmi");

    propertiesBmi.svg = svg;
    propertiesBmi.height = height;
    propertiesBmi.width = width;
    propertiesBmi.x = x;
}

function updateBmi(dailyAvgData, addFilter, removeFilter) {
console.log("updateBmi")
    var svg = propertiesBmi.svg;
    var height = propertiesBmi.height;
    var width = propertiesBmi.width;
    var x = propertiesBmi.x;

    var histData = calcBmiHistogramData(dailyAvgData);
    
    var bmis = Object.keys(histData);
    var pop = Object.values(histData);

                
    var newData = [];

    for(var i = 0; i < bmis.length; ++i) {
         newData.push({
            bmi: bmis[i],
            population: pop[i]
        });
    }
        
    var y = d3.scaleLinear()
    .range([height, 0]);

    y.domain([0, d3.max(newData, function(d) { return d.population; })]);


    // append the rectangles for the bar chart
    var bars = svg.selectAll(".bar")
      .data(newData, function (d) {return d.bmi;});
    

    bars.enter()
        .append("rect")
        .attr("fill", "#2c3e50")
        .attr("class", "bar pass-through")
        .attr("x", function(d) { return x(d.bmi); })
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