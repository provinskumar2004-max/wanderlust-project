const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
    accessToken: mapToken
});


// INDEX
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};


// NEW FORM
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


// SHOW LISTING
module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash(
            "error",
            "Listing you requested does not exist!"
        );

        return res.redirect("/listings");
    }

    /*
     * If coordinates are missing/empty,
     * get them again from Mapbox using listing location.
     */
    if (
        !listing.geometry ||
        !listing.geometry.coordinates ||
        listing.geometry.coordinates.length !== 2
    ) {
        try {
            console.log(
                "Coordinates missing. Geocoding:",
                listing.location
            );

            const response = await geocodingClient
                .forwardGeocode({
                    query: listing.location,
                    limit: 1
                })
                .send();

            if (
                response.body.features &&
                response.body.features.length > 0
            ) {
                listing.geometry =
                    response.body.features[0].geometry;

                await listing.save();

                console.log(
                    "Updated geometry:",
                    listing.geometry
                );
            } else {
                console.log(
                    "Location not found:",
                    listing.location
                );
            }

        } catch (err) {
            console.log(
                "GEOCODING ERROR:",
                err.message
            );
        }
    }

    console.log("FINAL LISTING:", listing);

    res.render("listings/show.ejs", {
        listing,
        mapToken: process.env.MAP_TOKEN
    });
};


// CREATE LISTING
module.exports.createListing = async (req, res) => {
    try {
        console.log(
            "LOCATION:",
            req.body.listing.location
        );

        console.log(
            "MAP TOKEN EXISTS:",
            !!process.env.MAP_TOKEN
        );

        const response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1
            })
            .send();

        console.log(
            "MAPBOX RESPONSE:",
            response.body
        );

        if (
            !response.body.features ||
            response.body.features.length === 0
        ) {
            req.flash(
                "error",
                "Location not found!"
            );

            return res.redirect(
                "/listings/new"
            );
        }

        const url = req.file.path;
        const filename = req.file.filename;

        const newListing = new Listing(
            req.body.listing
        );

        newListing.owner = req.user._id;

        newListing.image = {
            url,
            filename
        };

        newListing.geometry =
            response.body.features[0].geometry;

        console.log(
            "GEOMETRY:",
            newListing.geometry
        );

        const savedListing =
            await newListing.save();

        console.log(
            "SAVED LISTING:",
            savedListing
        );

        req.flash(
            "success",
            "New listing Created!"
        );

        res.redirect("/listings");

    } catch (err) {
        console.log(
            "CREATE LISTING ERROR:",
            err
        );

        req.flash(
            "error",
            err.message
        );

        res.redirect("/listings/new");
    }
};


// EDIT FORM
module.exports.renderEditForm = async (
    req,
    res
) => {
    const { id } = req.params;

    const listing =
        await Listing.findById(id);

    if (!listing) {
        req.flash(
            "error",
            "Listing you requested for does not exist"
        );

        return res.redirect("/listings");
    }

    let originalImageUrl =
        listing.image.url;

    originalImageUrl =
        originalImageUrl.replace(
            "/upload",
            "/upload/h_300,w_250"
        );

    res.render(
        "listings/edit.ejs",
        {
            listing,
            originalImageUrl
        }
    );
};


// UPDATE LISTING
module.exports.updateListing = async (
    req,
    res
) => {
    const { id } = req.params;

    const listing =
        await Listing.findById(id);

    if (!listing) {
        req.flash(
            "error",
            "Listing not found!"
        );

        return res.redirect("/listings");
    }

    /*
     * If location is changed,
     * update coordinates as well.
     */
    if (
        req.body.listing &&
        req.body.listing.location &&
        req.body.listing.location !== listing.location
    ) {
        try {
            const response =
                await geocodingClient
                    .forwardGeocode({
                        query:
                            req.body.listing.location,
                        limit: 1
                    })
                    .send();

            if (
                response.body.features &&
                response.body.features.length > 0
            ) {
                listing.geometry =
                    response.body.features[0].geometry;
            }

        } catch (err) {
            console.log(
                "UPDATE GEOCODING ERROR:",
                err.message
            );
        }
    }

    Object.assign(
        listing,
        req.body.listing
    );

    if (typeof req.file !== "undefined") {
        const url = req.file.path;
        const filename = req.file.filename;

        listing.image = {
            url,
            filename
        };
    }

    await listing.save();

    req.flash(
        "success",
        "Listing Updated!"
    );

    res.redirect(`/listings/${id}`);
};


// DELETE LISTING
module.exports.destroyListing = async (
    req,
    res
) => {
    const { id } = req.params;

    const deletedListing =
        await Listing.findByIdAndDelete(id);

    console.log(
        "Deleted Listing:",
        deletedListing
    );

    req.flash(
        "success",
        "Listing Deleted"
    );

    res.redirect("/listings");
};