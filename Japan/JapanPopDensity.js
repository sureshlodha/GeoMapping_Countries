//Define Margin
var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
    width = (960 * .8) - margin.left -margin.right,
    height = (500 * 1.5) - margin.top - margin.bottom;

//Define SVG body and groups
var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
            
var svgPop = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgIncome = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// SVG Legend
/* screen.width will make sure that the legend doesn't get
   put on the same line as the japan map */
var svgLegend = d3.select("body")
            .append("svg")
            .attr("class", "LegendSVG")
            .attr("width", screen.width)
            .attr("height", 100);



//Define map projection
var projection = d3.geoMercator()
                    .center([137, 34])
				    .translate([width/2, height/2])
				    .scale([1400]);

//Define path generator
var path = d3.geoPath()
                .projection(projection);

// Define Color Scale.
// ScalePow is used for population Density
// ScaleLinear is used for Income per Capita
var color = d3.scalePow().exponent(-0.5)
                .range(['#e5f5f9', '#66c2a4', '#00441b']);

var color2 = d3.scaleLinear()
                //.range(['#efedf5','#9e9ac8','#3f007d']);
                .range(['green','yellow','red']); // I changed this because I thought it looked better

//Load in agriculture data
d3.csv("PopulationDensity.csv", function(data) {

    //Set input domain for color scale
    // Population Density
    var minPop = d3.min(data, function(d) { return parseFloat(d.Population_Density); });
    var maxPop = d3.max(data, function(d) { return parseFloat(d.Population_Density); });
    color.domain([
        minPop, (minPop + maxPop)/2 , maxPop
    ]);
    // Income Per Capita
    var minIncome = d3.min(data, function(d) { return parseFloat(d.IncomePerCapita); });
    var maxIncome = d3.max(data, function(d) { return parseFloat(d.IncomePerCapita); });
    color2.domain([
        minIncome, (minIncome + maxIncome)/2, maxIncome
    ]);
    
    console.log( "Population Density min: " + d3.min(data, function(d) { return parseFloat(d.Population_Density); }) );
    console.log( "Population Density max: " + d3.max(data, function(d) { return parseFloat(d.Population_Density); }) );
    console.log( "Income Per Capita min : " + minIncome);
    console.log( "Income Per Capita max : " + maxIncome);
    console.log( data );
    
    //Load in GeoJSON data
    d3.json("Japan.json", function(json) {
        
        //Merge the ag. data and GeoJSON
        //Loop through once for each density data value
        for (var i = 0; i < data.length; i++) {
				
            //Grab prefecture name
            var dataPrefecture = data[i].Prefecture;
						
            //Grab data value, and convert from string to float
            var dataValue = parseFloat(data[i].Population_Density);
            var dataIncome = parseFloat(data[i].IncomePerCapita);
				
            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
						
                var jsonPrefecture = json.features[j].properties.NAME_1;
				
                if (dataPrefecture == jsonPrefecture) {
						
                    //Copy the data value into the JSON
                    json.features[j].properties.Population_Density = dataValue;
                    json.features[j].properties.IncomePerCapita = dataIncome;
								
                    //Stop looking through the JSON
                    break;
								
                }
            }		
        }

        //Bind data and create one path per GeoJSON feature
        var PopDensityPath = svgPop.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("visibility", "visible")
            .style("fill", function(d) {
                //Get data value
                var value = d.properties.Population_Density;
                var val_income = d.properties.IncomePerCapita;
                var name = d.properties.NAME_1;
                console.log(name + ":" + value + ", IPC: "+ val_income);
					   		
                    if (value) {
                        //If value exists…
                        return color(value);
                    } else {
                        //If value is undefined…
                        return "#ccc";
                    }
                })
            .style("stroke", "black");
        
        var IncomePerCapitaPath = svgIncome.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("visibility", "hidden")
            .style("fill", function(d) {
                //Get data value
                var value = d.properties.Population_Density;
                var val_income = d.properties.IncomePerCapita;
                var name = d.properties.NAME_1;
                //console.log(name + ":" + value + ", IPC: "+ val_income);
					   		
                    if (val_income) {
                        //If value exists…
                        return color2(val_income);
                    } else {
                        //If value is undefined…
                        return "#ccc";
                    }
                })
            .style("stroke", "black");
        
        // Legend
        svgLegend.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(20,20)");

        var legendLinear = d3.legendColor()
                            .shapeWidth(50)
                            .orient('horizontal')
                            .labelFormat(d3.format(".0f"))
                            .scale(color);

        svgLegend.select(".legendLinear")
            .call(legendLinear);
        
        svgLegend.append("text")
                .attr("id", "Legendlabel")
                .attr("y", 0)
                .attr("x", 160)
                .attr("dy", "1em")
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-size", "12px")
                .text("2015 Population Density (Thousand per km2)");
        
        // Legend2 IncomePerCapita
        svgLegend.append("g")
            .attr("class", "legendLinearIncome")
            .attr("transform", "translate(350, 20)");
        
        var legendLinearIncome = d3.legendColor()
                                .shapeWidth(50)
                                .orient('horizontal')
                                .labelFormat(d3.format(".0f"))
                                .scale(color2);
        
        svgLegend.select(".legendLinearIncome")
            .call(legendLinearIncome);
        
        svgLegend.append("text")
                .attr("id", "Legendlabel")
                .attr("y", 0)
                .attr("x", 500)
                .attr("dy", "1em")
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-size", "12px")
                .text("2016 Income Per Capita (Ten-thousand Yen)");
        
        
        
        // Toggles the between the data shown
        var showPopData = true;
        d3.select(".toggleData")
            .on("click", function(){
                showPopData = !showPopData;
                
                if(showPopData){
                    PopDensityPath.attr("visibility", "visible");
                    IncomePerCapitaPath.attr("visibility", "hidden");
                }else{
                    PopDensityPath.attr("visibility", "hidden");
                    IncomePerCapitaPath.attr("visibility", "visible");
                }
            });

    });
});