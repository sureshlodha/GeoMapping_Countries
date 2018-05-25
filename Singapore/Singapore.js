var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    padding = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    vizWidth = 960,
    vizHeight = 500,
    plotWidth = vizWidth - margin.left - margin.right,
    plotHeight = vizHeight - margin.top - margin.bottom,
    panelWidth = plotWidth - padding.left - padding.right,
    panelHeight = plotHeight - padding.top - padding.bottom;

var viz = d3.select("body").append("svg")
    .classed("viz", true)
    .attr("width", vizWidth)
    .attr("height", vizHeight);

var plot = viz.append("g")
    .attr("class", "plot")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var panel = plot.append("g")
    .attr("class", "panel")
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("display", "none");

var color = d3.scaleThreshold()
    .domain([1, 100, 500, 2000, 5000, 10000, 15000, 20000])
    .range(d3.schemeOrRd[9]); //contains an array of nine strings representing the nine colors, ranging size is from 3 to 9;

var x = d3.scaleSqrt()
    .domain([0, 45000])
    .rangeRound([440, 950]);

var g = panel.append("g")
    .attr("class", "key")
    .attr("transform", "translate(" + panelWidth / 7 + "," + panelHeight / 1.1 + "), scale(0.8)");

var legend = g.selectAll("rect")
    .data(color.range().map(function (d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        // console.log(d[0]+"->"+d[1])
        return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function (d) {
        return x(d[0]);
    })
    .attr("width", function (d) {
        return x(d[1]) - x(d[0]);
    })
    .attr("fill", function (d) {
        // return color(30000);
        return color(d[0]);
    });

var legendText = g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population per square kilometer");

g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickValues(color.domain()))
    .select(".domain")
    .remove();


function drawTooltip(d) {
    // console.log(d);
    var xPosition = d3.event.pageX;
    var yPosition = d3.event.pageY;

    d3.select("#tooltip")
        .classed("hidden", false)
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .text(function () {
            return (d.properties.value === 0) ? (d.properties.Name + ' Density Not Available') : (d.properties.Name + ' Density: ' + d.properties.value)
        });
    //  .html(d.properties.Description);
    console.log(d.properties.Name + '->' + d.properties.value);
}

function mouseout() {
    d3.select("#tooltip").classed("hidden", true);
    d3.select(this).classed("highlight", false)
}


//Load in agriculture data
d3.csv("SingaporeData.csv", function (data) {
    //Load in GeoJSON data
    d3.json("SingaporePlanningArea.json", function (json) {

        //Merge the ag. data and GeoJSON
        //Loop through once for each ag. data value
        for (var i = 0; i < data.length; i++) {

            //Grab state name
            var dataState = data[i]['Planning Area'].toUpperCase();

            //Grab data value, and convert from string to float
            var dataValue = parseFloat(data[i].Density);

            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.Name;
                if (dataState == jsonState) {
                    //Copy the data value into the JSON
                    json.features[j].properties.value = dataValue;
                    //Stop looking through the JSON
                    break;
                }
            }
        }


        var projection = d3.geoMercator().fitSize([panelWidth, panelHeight], json),
            geoPath = d3.geoPath(projection);
        var path = d3.geoPath()
            .projection(projection);

        //Bind data and create one path per GeoJSON feature
        var graph = panel.append("g")
            .attr("class", "graph");

        var area = graph.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .classed("area", true)
            .style("fill", function (d) {
                //Get data value
                var value = d.properties.value;
                if (value === 0) {
                    //If value not exists…
                    return "#ccc";
                } else {
                    //If value exists...
                    // console.log(value);
                    return color(value);
                }
            })

            .on('mouseover', function (d) {
                d3.select(this).classed("highlight", true);
                drawTooltip(d);
            })
            .on('mouseout', mouseout);
    });
});