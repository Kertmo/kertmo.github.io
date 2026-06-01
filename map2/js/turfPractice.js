function turfFunctions() {
  console.log('This text is from a module')
  alert('Hello from my module!')
}

// define point coordinates
const pointCoords = [26.71552, 58.37393]
// define a point
const myPoint = turf.point(pointCoords)
// convert the point to geoJSON object
const geoJSON_point = L.geoJSON(myPoint)
// add the geoJSON object to the map
geoJSON_point.addTo(map)

export { turfFunctions };
