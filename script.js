fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
.then(response => response.json())
.then(data => {
	const { baseTemperature, monthlyVariance } = data
	const width = 1200
	const height = 500
	const padding = 48
	const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	const monthIndex = [0,1,2,3,4,5,6,7,8,9,10,11]
	const variance = monthlyVariance.map(d => d.variance);
	const minTemp = baseTemperature + d3.min(variance);
	const maxTemp = baseTemperature + d3.max(variance);
	const colors = [
		'#313695',
		'#4575b4',
		'#74add1',
		'#abd9e9',
		'#e0f3f8',
		'#ffffbf',
		'#fee090',
		'#fdae61',
		'#f46d43',
		'#d73027',
		'#a50026',
    ]

	// Setting Titles
	d3.select('#title')
		.text('Monthly Global Land-Surface Temperature')
	
	d3.select('#description')
		.text(`
			${monthlyVariance[0].year} - 
			${monthlyVariance[monthlyVariance.length - 1].year}:
			base temperatur ${baseTemperature}°C
		`)

	// Initializing SVG
	const svg = d3.select('main')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
	
	// X-Axis
	const xScale = d3.scaleBand()
		.domain(monthlyVariance.map(d => d.year))
		.range([0, width - padding * 2])

	const xAxis = d3.axisBottom(xScale)
		.tickValues(xScale.domain().filter(year => year % 10 === 0))
	
	svg.append('g')
      .attr('transform', `translate(${padding},${height - padding})`)
      .attr('id', 'x-axis')
      .call(xAxis)
	
	// Y-Axis
	const yScale = d3.scaleBand()
	  .domain(monthIndex)
	  .range([0, height - padding]);

	const yAxis = d3.axisLeft(yScale)
		.tickFormat(v => month[v])
	
	svg.append('g')
      .attr('transform', `translate(${padding}, 0)`)
      .attr('id', 'y-axis')
      .call(yAxis)
	
	// Legend
	const legendWidth = 400;
	const legendHeight = 300 / colors.length;
	const calcThreshold = (min, max, source) => {
		const step = (max - min) / source.length
		return source.map((v, i) => min + (i + 1) * step).slice(0, source.length - 1)
	}

	const legendThreshold = d3.scaleThreshold()
		.domain(calcThreshold(minTemp, maxTemp, colors))
		.range(colors);

	var legendX = d3.scaleLinear()
		.domain([minTemp, maxTemp])
		.range([0, legendWidth]);

	const legendXAxis = d3
		.axisBottom()
		.scale(legendX)
		.tickValues(legendThreshold.domain())
		.tickFormat(d3.format('.1f'))
	

	const legend = svg
		.append('g')
		.attr('id', 'legend')
		.attr('transform', `translate(${padding},${height + padding - legendHeight})`)

	legend
		.append('g')
		.selectAll('rect')
		.data(legendThreshold.range().map(color => {
				const d = legendThreshold.invertExtent(color);
				return !d[0] ? legendX.domain()[0] : !d[1] ? legendX.domain()[1] : d
			})
		)
		.enter()
		.append('rect')
		.style('fill', d => legendThreshold(d[0]))
		.attr('x', d => legendX(d[0]))
		.attr('y', '0')
		.attr('width', d => legendX(d[1]) - legendX(d[0]))
		.attr('height', legendHeight)
		.attr('stroke', '#262626')

	legend
		.append('g')
		.attr('transform', `translate(0,${legendHeight})`)
		.call(legendXAxis);
	
	// Tooltip
	const tooltip = d3.select('main')
		.append('div')
		.attr('id', 'tooltip')
		.style('opacity', '0')
	
	// Heat Map
	svg
      .append('g')
      .attr('transform', `translate(${padding}, 0)`)
      .selectAll('rect')
      .data(monthlyVariance)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => baseTemperature + d.variance)
		.attr('x', d => xScale(d.year))
		.attr('y', d => yScale(d.month - 1))
		.attr('width', xScale.bandwidth())
		.attr('height', yScale.bandwidth())
      .attr('fill', d => legendThreshold(baseTemperature + d.variance))
		.on('mouseover', (e, d) => {
			tooltip
				.style('opacity', '0.9')
				.style("left", (e.pageX + padding / 3) + "px")
         	.style("top", (e.pageY - padding) + "px")
				.html(`
					${d.year} - ${month[d.month - 1]}<br>
					Temperatur: ${(baseTemperature + d.variance).toFixed(1)}°C<br>
					Variance: ${d.variance.toFixed(1)}°C
				`)
				.attr('data-year', d.year)
		})
		.on('mouseleave', () => {
			tooltip.style('opacity', '0')
		})
})