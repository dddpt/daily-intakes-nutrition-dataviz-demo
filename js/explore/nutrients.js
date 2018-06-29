
var propertiesNutrients = {
  foodfirst:true,
  nutrientclassesWithYou: _.flatten(_.map(nutrientclasses,nc => [nc,nc+"You"]))
};

function calculateNutrientsAvg(dailyAvgData){
  console.log("calculateNutrientsAvg")
  console.log("dailyAvgData.length")
  console.log(dailyAvgData.length)
  var data = []

  dailyAvgData = dailyAvgData.filter(d => d.id!="you")
  dailyAvgYou = dailyAvgIntakesData.filter(d => d.id=="you")[0] // take "you" data from global dailyAvg object
  //dailyAvgData = dailyAvgData[1]

  console.log("dailyAvgYou")
  console.log(dailyAvgYou)
  console.log("dailyAvgData")
  console.log(dailyAvgData)

  var population = _.sum(_.map(dailyAvgData,d => d["population"] ))

  foodclasses.forEach(function(foodc){
    var line = {foodclass:foodclasses_names[foodc]}
    nutrientclasses.forEach(function(nutrientc){
      foodnut = foodc+"_"+nutrientc;
      line[nutrientc] = _.sum(_.map(dailyAvgData,d => d["population"]*d[foodnut] )) / population
      line[nutrientc+"You"] = dailyAvgYou[foodnut]
    })
    data.push(line)
  })

  console.log("calculated nutrients avg data:")
  console.log(data)

  return(data)
}


function createNutrients(dailyAvgData, addFilter, removeFilter) {
  console.log("createNutrients")
  var parent = document.getElementById("nutrients");
  containerWidth = parent.clientWidth;
  containerHeight = constants.componentHeight;
  var dataByFoodClass = calculateNutrientsAvg(dailyAvgIntakesData) // use the global daily Avg intakes data for proper axes domain extrapolation

  var margin = {top: 40, right: 40, bottom: 30, left: 40},
      width = containerWidth - margin.left - margin.right,
      height = containerHeight - margin.top - margin.bottom;

  var svgg = d3.select("#nutrients").append("svg") 
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  // x0 bottom axis: foodclasses
  var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1)
    .domain(_.map(dataByFoodClass,d => d.foodclass));

  // x1 and colorAxis: nutrientclasses
  var x1 = d3.scaleBand()
      .padding(0)//.05)
      .domain(propertiesNutrients.nutrientclassesWithYou)
      .rangeRound([0, x0.bandwidth()]);
  var colorAxis = d3.scaleOrdinal(d3.schemeSet1)
      //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
 

  // yl axis left
  var yl = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, //domain is 0 to max in data
        d3.max(dataByFoodClass, d => {return d3.max(nutrientclasses, nc => d[nc]) })
        ]).nice();

  // yl axis right
  var yr = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, //domain is 0 to max in data
        d3.max(dataByFoodClass, line => line["kcal"])
        ]).nice();
 
  svgg.append("g")
    .attr("id","nutrients-bar-container")

  // bottom axis
  svgg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

  // left axis (gramms)
  svgg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yl).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", yl(yl.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("gramms");

  // right axis (kcal)
  svgg.append("g")
      .attr("class", "axis")
      .call(d3.axisRight(yr).ticks(null, "s"))
      .attr("transform", "translate("+width+",0)")
    .append("text")
      .attr("x", -27)
      .attr("y", yl(yl.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("kcal");

  labelWidth = 100
  legendTranslateY =  + (width-nutrientclasses.length*labelWidth)/2

  //legend
  var legend = svgg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)//.attr("text-anchor", "end")
    .selectAll("g")
    .data(nutrientclasses.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate("+(legendTranslateY+i * labelWidth) + ",-33)"; });

  //legend squares
  legend.append("rect")
      .attr("x", 0)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", colorAxis);

  //legend texts
  legend.append("text")
      .attr("x", 23)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

  propertiesNutrients.svgg = svgg;
  propertiesNutrients.height = height;
  propertiesNutrients.width = width;
  propertiesNutrients.x0 = x0;
  propertiesNutrients.x1 = x1;
  propertiesNutrients.yl = yl;
  propertiesNutrients.yr = yr;
  propertiesNutrients.colorAxis = colorAxis;
}

function updateNutrients(dailyAvgData, addFilter, removeFilter) {
  console.log("updateNutrients")

  var svgg = propertiesNutrients.svgg,
  x0 = propertiesNutrients.x0,
  x1 = propertiesNutrients.x1,
  yl = propertiesNutrients.yl,
  yr = propertiesNutrients.yr,
  colorAxis = propertiesNutrients.colorAxis,
  height = propertiesNutrients.height;

  var dataByFoodClass = calculateNutrientsAvg(dailyAvgData);
  propertiesNutrients.dataByFoodClass = dataByFoodClass;

  var nutrientsBars = svgg.select("#nutrients-bar-container")
    .selectAll("g")
    .data(dataByFoodClass)

  nutrientsBars = nutrientsBars.enter().append("g")
    .attr("transform", function(d) { return "translate(" + x0(d.foodclass) + ",0)"; })
    .merge(nutrientsBars)

  var nutrientsBarsRect = nutrientsBars.selectAll("rect")
    .data(d => {return _.map(propertiesNutrients.nutrientclassesWithYou, nc => {return {key: nc, value: d[nc], nutrientclass: nc.replace("You","")}})} )

  function yryl(d){
    return d.key!="kcal"? yl(d.value) :  yr(d.value);
  }

  nutrientsBarsRect = nutrientsBarsRect.enter()
    .append("rect")
    .attr("x", function(d) { return x1(d.key); })
    .attr("width", d => d.key.includes("You")? x1.bandwidth()-4 : x1.bandwidth())
    .attr("fill", function(d) { return colorAxis(d.nutrientclass); })
    .attr("opacity", d => d.key.includes("You")? 0.5 : 1)
    //.attr("padding", d => d.key.includes("You")? 0.05 : 0)
  .merge(nutrientsBarsRect)
    .transition().duration(500)
    .attr("height", function(d) { return height - yryl(d); })
    .attr("y", yryl)

  // data-intro
  nutrientsBarContainer = svgg.select("#nutrients-bar-container").select("g")
    .attr("data-step", "2")
    .attr("data-intro", d => "Here, you have the nutrients intake for "+d.foodclass+". Your nutrients intake are given by the right-hand lighter bars. The left-hand bars gives the average intake for the selected population.")

  first_kcal_bar = svgg.select("[fill]")
    .attr("data-step", "3")
    .attr("data-intro", "Note that kilocalories (kcal) are measured on the right-hand axis, while the other nutrients are in gramms, on the left-hand axis.")
    
}