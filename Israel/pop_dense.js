//Width and height
var width = 800;
var height = 500;

//Create SVG element
var svg = d3.select("body")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

//Array of color thresholds for different population densities 
var colorDomain = [];
for (var i=0; i<8;i+=.3){
	colorDomain.push(i);
}

//Define quantize scale to sort data values into buckets of color
var color = d3.scaleThreshold()
	.domain(colorDomain)
	.range(d3.schemeReds[9]);


var x = d3.scaleSqrt()
	.domain([0, 10])
	.rangeRound([440, 950]);

//Population density legend location
var g = svg.append("g")
	.attr("class", "key")
	.attr("transform", "translate(100,40)");
//Population density legend rectangle and colors
g.selectAll("rect")
	.data(color.range().map(function(d) {
		d = color.invertExtent(d);
		if (d[0] == null) d[0] = x.domain()[0];
		if (d[1] == null) d[1] = x.domain()[1];
		return d;
	}))	
	.enter().append("rect")
	.attr("height", 8)
	.attr("x", function(d) { return x(d[0]); })
	.attr("width", function(d) { return x(d[1]) - x(d[0]); })
	.attr("fill", function(d) { return color(d[0]); });
//Legend text
g.append("text")
	.attr("class", "caption")
	.attr("x", x.range()[0])
	.attr("y", -6)
	.attr("fill", "#000")
	.attr("text-anchor", "start")
	.attr("font-weight", "bold")
	.text("Population per square kilometer");
//Legend ticks
g.call(d3.axisBottom(x)
	.tickSize(13)
	.tickValues(color.domain()))
	.select(".domain")
	.remove();


//Population density legend location
var g = svg.append("g")
	.attr("class", "key")
	.attr("transform", "translate(100,90)");
//Population density legend rectangle and colors
g.selectAll("rect")
	.data(color.range().map(function(d) {
		d = color.invertExtent(d);
		if (d[0] == null) d[0] = x.domain()[0];
		if (d[1] == null) d[1] = x.domain()[1];
		return d;
	}))	
	.enter().append("rect")
	.attr("height", 8)
	.attr("x", function(d) { return x(d[0]); })
	.attr("width", function(d) { return x(d[1]) - x(d[0]); })
	.attr("fill", function(d) { return color(d[0]); });
//Legend text
g.append("text")
	.attr("class", "caption")
	.attr("x", x.range()[0])
	.attr("y", -6)
	.attr("fill", "#000")
	.attr("text-anchor", "start")
	.attr("font-weight", "bold")
	.text("Arabic population");
//Legend ticks
g.call(d3.axisBottom(x)
	.tickSize(13)
	.tickValues(color.domain()))
	.select(".domain")
	.remove();


function popDense() {
//Load in csv data
	console.log("in popDense")
	d3.csv("pop_dense.csv", function(data) {

		//Load in GeoJSON data
		d3.json("israel.json", function(error, json) {
			if (error) throw error;


			var projection = d3.geoMercator()
				.fitSize([width, height], json);

			var path = d3.geoPath()
				.projection(projection);


			//Merge the population data and GeoJSON
			for (var i = 0; i < data.length; i++) {
				//Grab district name
				var dataDistrict = data[i].district;
				
				//Grab population value, and convert from string to float
				var dataPopulation = parseFloat(data[i].population);
				//Grab area value, and convert from string to float
				var dataArea = parseFloat(data[i].area);
				var density = (dataPopulation/dataArea)*1000;


				//Find the corresponding district inside the GeoJSON
				for (var j = 0; j < json.features.length; j++) {
					var jsonDistrict = json.features[j].properties.name;

					if (dataDistrict == jsonDistrict) {
						//Copy the data value into the JSON
						json.features[j].properties.value = density;
						//Stop looking through the JSON
						break;		
					}
				}	
			}


			//Bind data and create one path per GeoJSON feature
			svg.selectAll(".path")
				.data(json.features)
				.enter()
				.append("path")
				.attr("d", path)
				.style("fill", function(d) {
					//Get data value
					var value = d.properties.value;
					console.log(value)
					if (value) {
						//If value exists…
						return color(value);
					} else {
						//If value is undefined…
						return "#ccc";
					}
				});

			d3.selectAll("input[name='vis-type']").on("change", function(){
			    if (this.value==="pop_arab"){
			    	popArab();
			    }else{
			    	popDense();
			    }
			});

		});

	});
}

function popArab() {
	console.log("in popArab()")

	d3.csv("pop_arabic.csv", function(data) {

		//Load in GeoJSON data
		d3.json("israel.json", function(error, json) {
			if (error) throw error;


			var projection = d3.geoMercator()
				.fitSize([width, height], json);

			var path = d3.geoPath()
				.projection(projection);


			//Merge the population data and GeoJSON
			for (var i = 0; i < data.length; i++) {
				//Grab district name
				var dataDistrict = data[i].district;
				
				//Grab population value, and convert from string to float
				var dataArabPop = parseFloat(data[i].arabic_population);

				//Find the corresponding district inside the GeoJSON
				for (var j = 0; j < json.features.length; j++) {
					var jsonDistrict = json.features[j].properties.name;

					if (dataDistrict == jsonDistrict) {
						//Copy the data value into the JSON
						json.features[j].properties.value = dataArabPop;
						console.log(dataArabPop)
						//Stop looking through the JSON
						break;		
					}
				}	
			}


			//Bind data and create one path per GeoJSON feature
			svg.selectAll(".path")
				.data(json.features)
				.enter()
				.append("path")
				.attr("d", path)
				.style("fill", function(d) {
					//Get data value
					var value = d.properties.value;
					console.log(value)
					if (value) {
						//If value exists…
						return color(value);
					} else {
						//If value is undefined…
						return "#ccc";
					}
				});

		});

	});



}

popDense();