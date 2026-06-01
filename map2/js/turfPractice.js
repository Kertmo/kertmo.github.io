function turfFunctions(map) {
  console.log('This text is from a module');
  alert('Hello from my module!');

  const pointCoords = [26.71552, 58.37393];

  const myPoint = turf.point(pointCoords);

  const geoJSON_point = L.geoJSON(myPoint);

  geoJSON_point.addTo(map);
}

export { turfFunctions };
