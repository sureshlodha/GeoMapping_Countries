//Sources:
//http://d3-legend.susielu.com/#color-threshold
//http://bl.ocks.org/aerrity/4338818
//http://bl.ocks.org/shimizu/61e271a44f9fb832b272417c0bc853a5

//Define Margin
var margin = {left: 10, right: 10, top: 0, bottom: 0 }, 
    width = 620 - margin.left -margin.right,
    height = 720 - margin.top - margin.bottom;

//Define main SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Define Legend SVG
var svgLegend = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", 40 + margin.top + margin.bottom)
    .attr("transform", "translate(" + margin.left + "," + -620 + ")");

//Define map projection
var projection = d3.geoMercator()
    .scale([6000])
    .translate([1120, 7000])

//Define path generator
var path = d3.geoPath()
    .projection(projection);

//Define counties
var counties = svg.append("g")
    .attr("id", "ireland");

//Define Tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Define dictionaries to hold color scales and legends
var colorScaleDict = {};
var legendDict = {};

//Load GeoJSON data
d3.json("Ireland.json", function(error, geojson) {
    if (error) throw error;
    
    //Load CSV data
    d3.csv("PopDensity.csv", function(error, data) {
        if (error) throw error;
        
        //Add data from CSV to matching JSON data
        for (var jsonIndex = 0; jsonIndex < geojson.features.length; jsonIndex++) {
            var geojsonProperties = geojson.features[jsonIndex].properties
            for (var csvIndex = 0; csvIndex < data.length; csvIndex++) {
                var countyData = data[csvIndex];
                if (geojsonProperties.Name == countyData.Name) {
                    //console.log(jsonProperties)
                    //console.log(countyData)
                    geojsonProperties["pop"] = countyData["2016 Pop"];
                    geojsonProperties["popChange"] = countyData["Pop Change"];
                    geojsonProperties["popChangePer"] = countyData["Pop % Change"]
                    geojsonProperties["popDensity"] = countyData["Pop Density"];
                    geojsonProperties["ruralPop"] = countyData["2016 Rural Pop"];
                    geojsonProperties["ruralPopChange"] = countyData["Rural Pop Change"];
                    geojsonProperties["ruralPopChangePer"] = countyData["Rural Pop % Change"]
                    geojsonProperties["urbanPop"] = countyData["2016 Urban Pop"];
                    geojsonProperties["urbanPopChange"] = countyData["Urban Pop Change"];
                    geojsonProperties["urbanPopChangePer"] = countyData["Urban Pop % Change"]
                    geojsonProperties["irishSpeak"] = countyData["Irish�Speaking%"];
                }
            }
        }
        
        //Define color scales
        var colorScalePopDensity = d3.scaleLinear()
            .range(d3.schemeGreens[5])
            .domain([
                20, 50, 75, 150, 1500
            ]);

        var colorScaleUrbanPopChangePer = d3.scaleLinear()
            .range(d3.schemeGreens[3])
            .domain([
                d3.min(data, function(d) {return (d["Urban Pop % Change"]); }),
                d3.quantile(data, 0.5, function(d) {return (d["Urban Pop % Change"]); }),
                d3.max(data, function(d) {return (d["Urban Pop % Change"]); })
            ]);
        var colorScaleRuralPopChangePer = d3.scaleLinear()
            .range(d3.schemeGreens[3])
            .domain([
                d3.min(data, function(d) {return (d["Rural Pop % Change"]); }),
                d3.quantile(data, 0.5, function(d) {return (d["Rural Pop % Change"]); }),
                d3.max(data, function(d) {return (d["Rural Pop % Change"]); })
            ]);
        
        var colorScaleIrishSpeak = d3.scaleLinear()
            .range(d3.schemeGreens[3])
            .domain([
                d3.min(data, function(d) {return (d["Irish�Speaking%"]); }),
                d3.quantile(data, 0.5, function(d) {return (d["Irish�Speaking%"]); }),
                d3.max(data, function(d) {return (d["Irish�Speaking%"]); })
            ]);
        
        //Define legends
        var legendPopDensity = d3.legendColor()
            .shapeWidth(100)
            .cells([
                20, 50, 75, 150, 1500
            ])
            .orient('horizontal')
            .scale(colorScalePopDensity);
        
        var legendUrbanPopChangePer = d3.legendColor()
            .shapeWidth(100)
            .cells(5)
            .orient('horizontal')
            .scale(colorScaleUrbanPopChangePer);
        
        var legendRuralPopChangePer = d3.legendColor()
            .shapeWidth(100)
            .cells(5)
            .orient('horizontal')
            .scale(colorScaleRuralPopChangePer);
        
        var legendIrishSpeak = d3.legendColor()
            .shapeWidth(100)
            .cells([
                32, 35, 40, 45, 50
            ])
            .orient('horizontal')
            .scale(colorScaleIrishSpeak);
        
        //Add color scales to dictionary
        colorScaleDict["popDensity"]= colorScalePopDensity;
        colorScaleDict["urbanPopChangePer"] = colorScaleUrbanPopChangePer;
        colorScaleDict["ruralPopChangePer"] = colorScaleRuralPopChangePer;
        colorScaleDict["irishSpeak"] = colorScaleIrishSpeak;

        //Add legends to dictionary
        legendDict["popDensity"] = legendPopDensity;
        legendDict["urbanPopChangePer"] = legendUrbanPopChangePer;
        legendDict["ruralPopChangePer"] = legendRuralPopChangePer;
        legendDict["irishSpeak"] = legendIrishSpeak;
    })
    
    //Initialize counties with green fill
    counties.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("class", "ireland")
        .attr("fill", "rgb(49, 163, 84)")
        .attr("d", path)
        .attr("stroke", "#222")
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500) //ms
                .style("opacity", 0);
        });
})

//Change map based on dropdown menu
d3.selectAll("select[name=dropdown]").on("change", function() {
    //Get input from dropdown and retrieve associated color scale and legend
    choice = this.value;
    var colorScale = colorScaleDict[choice];
    var legend = legendDict[choice];
    
    //Update legend
    svgLegend.append("g")
        .attr("class", "legend");
    svgLegend.select(".legend")
        .call(legend);

    //Update color scale and tooltip info
    counties.selectAll("path")
        .attr("fill", function(d) {
            //console.log(d.properties)
            return colorScale(d.properties[choice]);
        })
        .on("mouseover", function(d) {
            tooltip.html("County: " + d.properties.Name + "<br>" + d.properties[choice])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 15) + "px")
                .style("background-color", "white")
                .transition()
                .duration(100) //ms
                .style("opacity", 1)
        });
})