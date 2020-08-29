import * as d3 from 'd3'

const bubblechart = (element, data, width, height, ballsize) => {
  // make a bubble chart d3 visualization

  const vdata = data.map(d => {
    return {
      ...d,
      x: Math.random() * width,
      y: Math.random() * height
    }
  })

  // function for inverse transformation of area pi*r^2
  const calc_r = count => {
    return ballsize * Math.sqrt(count)
  }

  d3.select(element).html('')
  var svg = d3
    .select(element)
    .append('svg')
    .attr('height', height)
    .attr('class', 'boxitem')
    .attr('width', width)
    .attr('viewBox', [0, 0, width, height])

  var circles = svg
    .selectAll('circle')
    .data(vdata)
    .enter()
    .append('circle')
    //                   .attr("r", function (d) {return d.count*ballsize })
    .attr('r', d => calc_r(d.count))
    .style('fill', d => {
      if (d.maxintensity == 0) {
        return 'lightgreen'
      } else if (d.maxintensity == 1) {
        return 'khaki'
      } else {
        return 'lightpink'
      }
    })

  var texts = svg
    .selectAll('texts')
    .data(vdata)
    .enter()
    .append('text')
    .text(d => d.muscle)
    .attr('text-anchor', 'middle')

  const ticked = () => {
    circles.attr('cx', d => d.x).attr('cy', d => d.y)
    texts.attr('x', d => d.x).attr('y', d => d.y)
  }

  var simulation = d3
    .forceSimulation()
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05))
    .force(
      'collide',
      d3.forceCollide(d => calc_r(d.count) + 1)
    )

  simulation.nodes(vdata).on('tick', ticked)
}

export { bubblechart }
