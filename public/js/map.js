// mapboxgl.accessToken = mapToken;

// const map = new mapboxgl.Map({
//     container: "map",
//     style: "mapbox://styles/mapbox/streets-v12",
//     center: listing.geometry.coordinates,
//     zoom: 9
// });

// console.log("Coordinates:", listing.geometry.coordinates);

// const marker = new mapboxgl.Marker({
//     color: "red"
// })
//     .setLngLat(listing.geometry.coordinates)
//     .setPopup(
//         new mapboxgl.Popup({ offset: 25 })
//             .setHTML(
//                 `<h3>${listing.title}</h3>
//                  <p>Exact Location will be provided after booking</p>`
//             )
//     )
//     .addTo(map);


const mapToken = window.mapToken;
const listing = window.listing;

console.log("Map Token Exists:", !!mapToken);
console.log("Listing:", listing);

if (!mapToken) {
    console.error("Mapbox token is missing!");
} else if (
    !listing ||
    !listing.geometry ||
    !listing.geometry.coordinates ||
    listing.geometry.coordinates.length !== 2
) {
    console.error(
        "Map cannot be loaded: coordinates are missing.",
        listing
    );
} else {

    mapboxgl.accessToken = mapToken;

    const coordinates = listing.geometry.coordinates;

    console.log("Map Coordinates:", coordinates);

    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: coordinates,
        zoom: 9
    });

    new mapboxgl.Marker({
        color: "red"
    })
        .setLngLat(coordinates)
        .setPopup(
            new mapboxgl.Popup({
                offset: 25
            }).setHTML(`
                <h3>${listing.title}</h3>
                <p>Exact Location will be provided after booking</p>
            `)
        )
        .addTo(map);
}