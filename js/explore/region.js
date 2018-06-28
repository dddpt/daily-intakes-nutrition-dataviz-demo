
var propertiesRegions = {
  regions: ["de", "fr","it"].map(Region),
  regionIndex: {"it":3, "de":1, "fr":2}
};

function groupByRegions(data) {
	
  var preprocessedData = data.map(function(d) {
    return [Region(d['region']), d['region'], d.population]; //3 killed in off-piste -> ["Off-piste skiing",2,3]
  }).filter(function (d) { // unsure: apply current filters? or only keep region 1-2-3?
    return propertiesRegions.regions.includes(d[0]);
  });

    
  var result = _.groupBy(preprocessedData, function (d) {
    return d[0]; 
  });
  result = _.map(result, function (d) {
    return {
      'region': d[0][0], 
      'population': _.sum(_.map(d, function (x) {return x[2];})),
      'index': propertiesRegions.regionIndex[d[0][1]],
    };
  });

        return result;
}


function createRegions(dailyAvgData, addFilter, removeFilter) {
	  var parent = document.getElementById("region");
  containerWidth = parent.clientWidth;
  containerHeight = constants.componentHeight;

  var margin = {
      top: 60,
      right: 30,
      bottom: 60,
      left: 100
    },
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;

    var startDragY = null,
      endDragY = null,
      fromIdx = null,
      toIdx = null;
  
    var drag = d3.drag()
      .on("drag", dragged)
      .on("start", startDrag)
      .on("end", endDrag);
  
  
    var removeCurrentFilter = function () {
      if (propertiesRegions.filterName) {
        // avoids infinite calls
        var toRemove = propertiesRegions.filterName;
        propertiesRegions.filterName = undefined;
        removeFilter(toRemove);
      }
      svg.selectAll(".bar").attr("opacity", 1);
    };
    
    function startDrag() {
      startDragY = d3.event.y;
      svg.selectAll(".bar").attr("opacity", 0.5);
    }
  
  
    function dragged() {
      
      endDragY = d3.event.y;

      var top = startDragY,
        bottom = endDragY;
      
      
      if (bottom < top) {
        var temp = bottom;
        bottom = top;
        top = temp;
      }

  
      fromIdx = Math.floor((top / y.step())) + 1;
      toIdx = Math.ceil((bottom / y.step())) + 1;

      fromIdx = Math.max(0, fromIdx);
      toIdx = Math.min(toIdx, propertiesRegions.regions.length + 1);

      svg.selectAll('.bar').attr('opacity', function (d) {
        return d.index >= fromIdx && d.index < toIdx ? 1 : 0.5;
      });
    }
    
    function endDrag() {
      dragged()

      if (propertiesRegions.filterName) {
        removeCurrentFilter()
        if (Math.abs(endDragY - startDragY) < 5) {
            return;
        }
      }

      if (fromIdx <= 1 && toIdx >= propertiesRegions.regions.length + 1) {
        removeCurrentFilter();
        return;
      }

      // filter name
      if (fromIdx + 1 == toIdx) {
        filterName = Region(fromIdx) + " only";
      } else {
        filterName = "Not " + Region(_.difference([1,2,3], [fromIdx, toIdx - 1])[0]);
      }
  
      var filterFunction = function (d) {
        return propertiesRegions.regionIndex[d.region] >= fromIdx && propertiesRegions.regionIndex[d.region] < toIdx;
      };
  
      propertiesRegions.filterName = filterName;
      addFilter(filterName, filterFunction, removeCurrentFilter);
    }
  
    var svg = d3.select("#region").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")

      
  // full clickable rect
    svg.append("g")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white")
      .call(drag);
  
  var y = d3.scaleBand()
    .range([0, height])
    .padding(0.1);
  
    y.domain(propertiesRegions.regions);
  
  // add the x Axis
  // svg.append("g")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(d3.axisBottom(x));
  
  // y axis label
  // svg.append("text")
  //   .attr("text-anchor", "middle")
  //   .attr("class", "histogram-label")
  //   .attr("transform", "translate("+ -30 +","+(height/2)+")rotate(-90)")
  //   .text("activity level");
  
    svg.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "histogram-label")
    .attr("transform", "translate("+ (width/2) +","+(height + 20)+")")
    .text("population");
  
    // add the y Axis
  svg.append("g")
  .call(d3.axisLeft(y))
  .attr('class', 'y-axis');

  propertiesRegions.y = y;
  propertiesRegions.svg = svg;
  propertiesRegions.width = width;
  propertiesRegions.height = height;
}

function updateRegions(dailyAvgData, addFilter, removeFilter) {
	  var height = propertiesRegions.height;
  var width = propertiesRegions.width;
  var svg = propertiesRegions.svg;
  var y = propertiesRegions.y;

  var data = groupByRegions(dailyAvgData);

  var x = d3.scaleLinear()
    .range([0, width]);

  x.domain([0, d3.max(data, function (d) {
    return d.population;
  })]);

    
  // append the rectangles for the bar chart
  var enterData = svg.selectAll(".bar")
    .data(data, function (d) {
      return d.region;
    });

  enterData.enter().append("rect")
      .attr("class", "bar pass-through")
      .attr("fill", function (d) {
        return activityColor(d.region);
      })
      .attr("height", y.bandwidth())
      .attr("y", function (d) {
        return y(d.region);
      })
      .attr("x", 1)
      .attr("width", function (d) {
        return x(d.population);
      })
    .merge(enterData)
      .transition().duration(500)
      .attr("y", function (d) {
        return y(d.region);
      })
      .attr("width", function (d) {
        return x(d.population);
      });

  enterData.exit().remove();

  var deathLabels = svg.selectAll(".label")
    .data(data, function (d) {
      return d.region;
    });

  deathLabels.enter().append("text")
      .attr("text-anchor", "left")
      .attr("class", "histogram-label label")
      .attr("transform", function (d) {
        return "translate("+ (x(d.population) + 5) +","+(y(d.region) + y.step() / 2)+")";
      })
      .text(function (d) {return d.population; })
    .merge(deathLabels)
      .transition().duration(500)
      .attr("transform", function (d) {
        return "translate("+ (x(d.population) + 5) +","+(y(d.region) + y.step() / 2)+")";
      })
      .text(function (d) {return d.population; });
  
  deathLabels.exit().remove();


}