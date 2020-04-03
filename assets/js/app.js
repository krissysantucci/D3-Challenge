// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 620;

var margin = {
  top: 20,
  right: 40,
  bottom: 200,
  left: 100
};

var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

// append a div class to the scatter element
//var chart = d3.select('#scatter')
  //.append('div')
  //.classed('chart', true);

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// d3.select("body")
//   .append("div")
//   .attr("class", "tooltip")
//   .style("opacity", 0);



// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  }
  
// function used for updating xAxis var upon click on axis label
function renderxAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(3000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis var upon click on axis label
 function renderyAxis(newYScale, yAxis) {
     var leftAxis = d3.axisLeft(newYScale);
  
     yAxis.transition()
       .duration(3000)
       .call(leftAxis);
  
     return yAxis;
  }
// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(3000)
    .attr("cx", data => newXScale(data[chosenXAxis]))
    .attr("cy", data => newYScale(data[chosenYAxis]))
    ;

  return circlesGroup;
}
//function for updating STATE labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]));

    return textGroup
}
//function to style x-axis values for tooltips
function styleX(value, chosenXAxis) {

    //style based on variable
    //poverty
    if (chosenXAxis === "poverty") {
        return `${value}%`;
    }
    //age
    else if (chosenXAxis === "age") {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
};
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xlabel
  var yLabel
  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty (%):";
  }
  else if (chosenXAxis === "age"){
    var xlabel = "Age (median):";
  }
  else {
    var xlabel = "Income (median):";
  }
//Y label
  //
  if (chosenYAxis === "obesity") {
    var yLabel = "Obesity (%):";
  }
  else if(chosenYAxis === "smokes") {
    var yLabel = "Smokes (%):";
  }
  //
  else {
    var yLabel = "Healthcare (median):";
  }
  // Step 1: Initialize Tooltip
  var toolTip = d3.tip() 
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
    });
// Step 2: Create the tooltip in chartGroup.
  circlesGroup.call(toolTip);

// Step 3: Create "mouseover" event listener to display tooltip
  circlesGroup.on("mouseover", toolTip.show)
    .on('mouseout', toolTip.hide);
    
    return circlesGroup;
  }
    // onmouseout event
    // .on("mouseout", function(data, index) {
    //   toolTip.hide(data);
    // });

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;
  console.log(censusData);

  // parse data
 censusData.forEach(function(data) {
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;

  });

// xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

// Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
 var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles 
  var circlesGroup = chartGroup.selectAll("stateCircle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed('stateCircle', true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 14)
    .attr("opacity", ".5")
 

    //append Initial Text
    var textGroup = chartGroup.selectAll("stateText")
       .data(censusData)
       .enter()
       .append('text')
       .classed('stateText', true)
       .attr('x', d => xLinearScale(d[chosenXAxis]))
       .attr('y', d => yLinearScale(d[chosenYAxis]))
       .attr('dy', 3)
       .attr('font-size', '10px')
       .text(function(d){return d.abbr});

  // Create group for  2 x- axis labels
var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 10})`);

var povertyLabel = xlabelsGroup.append("text")
    .classed("active", true)
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .text("Poverty (%)");

var ageLabel = xlabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)    
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .text("Age (median)");

var incomeLabel = xlabelsGroup.append('text')
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .text("Income (median)")

  // append y axis
var yLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${0 - margin.left/4}, ${height/2})`);

var obesityLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("x", 0)
    .attr("y", 0 - 20)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "obesity")
    .text("Obesity (%)");

var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 40)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("aText", true)
    .classed("inactive", true)
    .text("Smokes (%)");

var healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 60)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("aText", true)
    .classed("inactive", true)
    .text("Healthcare (median)")

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value != chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderxAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update text 
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
        povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        // obesityLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // smokesLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // healthcareLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", true)
            .classed("inactive", false);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        // obesityLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // smokesLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // healthcareLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        }
        else {
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            // obesityLabel
            //     .classed("active", false)
            //     .classed("inactive", true);
            // smokesLabel
            //     .classed("active", false)
            //     .classed("inactive", true);
            // healthcareLabel
            //     .classed("active", false)
            //     .classed("inactive", true);
                
            }
      }
    });

    // y axis labels event listener
  yLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");

    if (value != chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

       console.log(chosenXAxis)

      // functions here found above csv import
      // updates y scale for new data
      yLinearScale = yScale(censusData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderyAxis(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      //update text 
      textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "obesity") {
        obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        // povertyLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // ageLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // incomeLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        // povertyLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // ageLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // incomeLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        
      
      }
      else {
        obesityLabel
              .classed("active", false)
              .classed("inactive", true);
        smokesLabel
              .classed("active", false)
              .classed("inactive", true);
        healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
        // povertyLabel
        //       .classed("active", false)
        //       .classed("inactive", true);
        // ageLabel
        //       .classed("active", false)
        //       .classed("inactive", true);
        // incomeLabel
        //       .classed("active", false)
        //       .classed("inactive", true);
          }
    }
  });
});
