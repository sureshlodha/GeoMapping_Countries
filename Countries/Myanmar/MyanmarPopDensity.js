//Width and height
var w = 700;
var h = 700;
//Define map projection
var projection = d3.geoMercator()
					.rotate([-101, -20])
               		.scale(2000)
			   		.translate([w/2, h/2]);
//Define path generator
var path = d3.geoPath()
			 .projection(projection);
			
var colorUrRu = d3.scaleQuantile()
              .range((d3.schemeRdYlGn[9]).reverse());
var colorPop = d3.scaleQuantile()
               .range(["#9ebcda","#8c96c6","#8c6bb1","#88419d","#810f7c","#4d004b"]);

var legScalePop = d3.scaleLinear()
    .rangeRound([400, 670]);

var legScalePer = d3.scaleLinear()
    .rangeRound([400, 670]);

//Create SVG element
var svg = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

var popKey = svg.append("g")
    .attr("class", "key1")
    .attr("transform", "translate(0,40)");

var perKey = svg.append("g")
    .attr("class", "key2")
    .attr("transform", "translate(0,150)");

svg.append("text")
    .attr("class", "caption")
    .attr("x", legScalePop.range()[0])
    .attr("y",30)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population Density (people per km^2)");

svg.append("text")
    .attr("class", "caption")
    .attr("x", legScalePer.range()[0])
    .attr("y",140)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Urban Population %");

svg.append("div").attr("x",legScalePop.range()[0]).attr("y",100);

d3.csv("PopulationMerged.csv", function(data) {

	//Load in GeoJSON data
	d3.json("Myanmar.json", function(error,json) {
		if (error) throw error;
			//Merge the population data and GeoJSON
			//Loop through once for each pop data value
		var maxDensity = 0;
			for (var i = 0; i < data.length; i++) {
			
				//Grab province name
				var dataProvince = data[i].province;
					
				//Grab data value, and convert from string to float
				var dataTotal = parseFloat(data[i].total);
				
				var dataUrban = parseFloat(data[i].urban);
				
				var dataArea = parseFloat(data[i].area);
				
				var dataDensity = 
				dataTotal/dataArea;
				
				var urbPercentage = (dataUrban/dataTotal)*100;
				
				if(dataDensity > maxDensity){
					maxDensity = dataDensity;
				}
							
				//Find the corresponding state inside the GeoJSON
				for (var j = 0; j < json.features.length; j++) {
						
					var jsonProvince = json.features[j].properties.NAME_1;
			
					if (dataProvince == jsonProvince) {
						
						//Copy the data value into the JSON
						json.features[j].properties.popDen = dataDensity;
						
						json.features[j].properties.urRu = urbPercentage;
								
						//Stop looking through the JSON
						break;
								
					}
				}		
			}

			legScalePop.domain([0,maxDensity]);
			legScalePer.domain([0,100]);
		
			colorUrRu.domain([ 0 , 100]);
			colorPop.domain([ 0 , maxDensity]);
		
			var legTickPop = [0];
		    var legTickPer = [0];
		
			popKey.selectAll("rect")
  			 .data(colorPop.range().map(function(d) {
      		 	d = colorPop.invertExtent(d);
      			if (d[0] == null) d[0] = legScalePop.domain()[0];
      			if (d[1] == null) d[1] = legScalePop.domain()[1];
      			return d;
    			}))
  			 .enter().append("rect")
    		 .attr("height", 15)
    		 .attr("x", function(d) { legTickPop.push(Math.round(d[1]*10)/10);return legScalePop(d[0]); 
									})
    		 .attr("width", function(d) { return legScalePop(d[1]) - legScalePop(d[0]); })
    		 .attr("fill", function(d) { return colorPop(d[0]); });
		
			perKey.selectAll("rect")
  			 .data(colorUrRu.range().map(function(d) {
      		 	d = colorUrRu.invertExtent(d);
      			if (d[0] == null) d[0] = legScalePer.domain()[0];
      			if (d[1] == null) d[1] = legScalePer.domain()[1];
      			return d;
    			}))
  			 .enter().append("rect")
    		 .attr("height", 15)
    		 .attr("x", function(d) {legTickPer.push(Math.round(d[1]));return legScalePer(d[0]); })
    		 .attr("width", function(d) { return legScalePer(d[1]) - legScalePer(d[0]) ; })
    		 .attr("fill", function(d) { return colorUrRu(d[0]); });
		
		var popTickCall = popKey.call(d3.axisBottom(legScalePop)
    		.tickSize(15)
    		.tickFormat(function(x, i) { return x  })
    		.tickValues(legTickPop));
		
		popTickCall.selectAll("text")
        	.style("text-anchor", "end")
			.attr("dx", "-2em")
			.attr("dy", "-0.60em")
        	.attr("font-size", "10px")
			.attr("font-weight", "bold")
        	.attr("transform", "rotate(-70)");
		
	   var perTickCall = perKey.call(d3.axisBottom(legScalePer)
    		.tickSize(14)
    		.tickFormat(function(x, i) { return x  })
    		.tickValues(legTickPer));
		
		perTickCall.selectAll("text")
        	.style("text-anchor", "end")
			.attr("dx", "-2em")
			.attr("dy", "-0.60em")
        	.attr("font-size", "10px")
			.attr("font-weight", "bold")
        	.attr("transform", "rotate(-70)");
		
		
		perTickCall.select(".domain").remove();
		popTickCall.select(".domain").remove();
		 

		
		svg.selectAll("path")
			   .data(json.features)
			   .enter()
			   .append("path")
			   .attr("d", path)
		   		.style("stroke", "white")
			   .style("stroke-width", "2")
			   .style("fill", function(d) {
					//Get data value
		   			var total = d.properties.popDen;
					if (total) {
						//If value exists…
				   		return colorPop(total);
			   		} else {
			   			//If value is undefined…
				   		return "#ccc";
			   		}
			   });
		
			
			//Bind data and create one path per GeoJSON feature
		   d3.select(".POP").on("click", function(){
				d3.selectAll("h1").html("Myanmar Population Density, 2014");
				svg.selectAll("path")
			   	   .data(json.features)
			       .transition()
			       .style("fill", function(d) {
					//Get data value
		   			var total = d.properties.popDen;
					if (total) {
						//If value exists…
				   		return colorPop(total);
			   		} else {
			   			//If value is undefined…
				   		return "#ccc";
			   		}
			   });
		  });
		  d3.select(".RU").on("click", function(){
			 d3.selectAll("h1").html("Myanmar Urban vs. Rural Population, 2014");
	     	svg.selectAll("path")
			   .data(json.features)
			   .style("stroke", "white")
			   .transition()
			   .style("fill", function(d) {
					//Get data value
		   			var percentage = d.properties.urRu;
					  		
					if (percentage) {
						//If value exists…
				   		return colorUrRu(percentage);
			   		} else {
			   			//If value is undefined…
				   		return "#ccc";
			   		}
			   })
			  .style("stroke", 5);
		
		
		 });
		
	});
});