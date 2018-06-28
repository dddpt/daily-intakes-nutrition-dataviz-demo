var propertiesTextual = {};

function createTextual(dailyAvgData, addFilter, removeFilter, selectPoint) {

}

function updateTextual(dailyAvgData, addFilter, removeFilter, selectPoint) {
  var pop = _.sum(dailyAvgData.map(function (d) {return d.population | 0}))
  var data = [
    { name: "population", value: pop},
    { name: "sex", value: _.sum(dailyAvgData.map(function (d) {return 100*(d.sex=="f")*d.population | 0}))/pop}
  ]

  function textualDescription(d) {
    switch (d.name) {
      case "population":
        return 'Number of individuals: ' + d.value;
      case "sex":
        return 'proportion of women: ' + Math.round(d.value,1) +"%";
      default:
        throw "unknow textual type " + d.name
    }
  }

  var textuals = d3.select("#textual").selectAll(".textual-class")
    .data(data, function (d) {return d.name})
  
  textuals.enter()
      // .append("div").attr("class", "one-third column")
      .append("h4").attr("class", "textual-class")
    .merge(textuals)
      .text(textualDescription)
      .filter(function (d) { return  d.name == 'sex'; })
        .attr("data-step", "6")
        .attr("data-intro", "Be safe and have fun!")
}