import { pointsCollection } from "../js/points.js";
function turfFunctions(map) {
  console.log('This text is from a module');
  alert('Hello from my module!');

  const pointCoords = [26.71552, 58.37393];
  const myPoint = turf.point(pointCoords);
  const geoJSON_point = L.geoJSON(myPoint);
  geoJSON_point.addTo(map);
  const lineCoords = [
    [26.71379, 58.37476],
    [26.71554, 58.37349],
    [26.71553, 58.37434],
    [26.71630, 58.37378],
    [26.71473, 58.37407]
  ]
  // define the line object
  const myLine = turf.lineString(lineCoords);  
  const geoJSON_line = L.geoJSON(myLine);
  geoJSON_line.addTo(map);

  const alongPoint = turf.along(myLine, 0.05, { units: 'kilometers' });
  L.geoJSON(alongPoint).addTo(map);
  
  const polygonCoords = [[
    [26.71355, 58.37468],
    [26.71404, 58.37430],
    [26.71433, 58.37429],
    [26.71550, 58.37345],
    [26.71660, 58.37388],
    [26.71615, 58.37420],
    [26.71589, 58.37431],
    [26.71552, 58.37461],
    [26.71521, 58.37496],
    [26.71480, 58.37481],
    [26.71449, 58.37502],
    [26.71355, 58.37468]
  ]]
  // define polygon object
  const myPolygon = turf.polygon(polygonCoords);
  const geoJSON_polygon = L.geoJSON(myPolygon);
  geoJSON_polygon.addTo(map);

  
  const pointCoords2 = [26.71489, 58.37439];
  const myPoint2 = turf.point(pointCoords2);
  const geoJSON_point2 = L.geoJSON(myPoint2);
  geoJSON_point2.addTo(map);
  
  // distane seaded
  const options = { units: 'meters' };
  
  // kauguse arvutamine turf points
  const distance = turf.distance(myPoint, myPoint2, options);
  
  const distanceRounded = Math.round(distance);
  const roundedToTwoDecimals = Math.round(distance * 100) / 100;
  
  //console.log(`distance is ${distance} meters`);
  //console.log(`rounded to nearest integer: ${distanceRounded}`);
  //console.log(`rounded to two decimal points: ${roundedToTwoDecimals}`);

  const areaMeasurement = turf.area(myPolygon)
  const areaRounded = Math.round(areaMeasurement)
  //console.log(`Area without rounding: ${areaMeasurement}`)
  //console.log(`Rounded area is ${areaRounded} square meters`)

  // point buffer
  const statueBuffer = turf.buffer(myPoint, 20, { units: 'meters' });
  //L.geoJSON(statueBuffer).addTo(map);
  
  // line buffer
  const lineBuffer = turf.buffer(myLine, 20, { units: 'meters' });
  //L.geoJSON(lineBuffer).addTo(map);
  
  // polygon buffer
  const polygonBuffer = turf.buffer(myPolygon, 20, { units: 'meters' });
  //L.geoJSON(polygonBuffer).addTo(map);
  
  const polygonBufferNegative = turf.buffer(myPolygon, -10, { units: 'meters' });
  //L.geoJSON(polygonBufferNegative).addTo(map);

  const points = turf.points(pointsCollection);
  //L.geoJSON(points).addTo(map);
  
  const pointsWithinBorders = turf.pointsWithinPolygon(points, myPolygon);
  console.log(pointsWithinBorders)
  L.geoJSON(pointsWithinBorders).addTo(map);

}
export { turfFunctions };
