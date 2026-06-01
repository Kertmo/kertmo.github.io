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
}

export { turfFunctions };
