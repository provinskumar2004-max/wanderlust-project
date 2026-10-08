const Listing = require("../models/listing");

// Mapbox temporarily disabled


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

    console.log("FINAL LISTING:", listing);

    res.render("listings/show.ejs", {
        listing
    });
};


// CREATE LISTING
module.exports.createListing = async (req, res) => {
    try {
        console.log(
            "LOCATION:",
            req.body.listing.location
        );

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

        // Mapbox temporarily disabled.
        // Geometry will be added later when Mapbox is restored.

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

    // Mapbox temporarily disabled.
    // Existing geometry will remain unchanged.

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
