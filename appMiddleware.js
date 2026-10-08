const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");

const {
    listingSchema,
    reviewSchema
} = require("./schema.js");

// Check Login

module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.session.redirectUrl = req.originalUrl;

        req.flash(
            "error",
            "You must be logged in first!"
        );

        return res.redirect("/login");
    }

    next();
};

// Save Redirect URL

module.exports.saveRedirectUrl = (req, res, next) => {

    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    next();
};

// Check Listing Owner

module.exports.isOwner = async (req, res, next) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);

    if (!listing) {

        req.flash(
            "error",
            "Listing not found!"
        );

        return res.redirect("/listings");
    }

    if (!req.user) {

        req.flash(
            "error",
            "Please login first!"
        );

        return res.redirect("/login");
    }

    if (!listing.owner) {

        req.flash(
            "error",
            "Listing owner not found!"
        );

        return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {

        req.flash(
            "error",
            "You are not the owner of this listing."
        );

        return res.redirect(`/listings/${id}`);
    }

    next();
};

// Validate Listing

module.exports.validateListing = (req, res, next) => {
    if (!req.body.listing) {
        req.body.listing = {};
    }
    if (req.file) {
        req.body.listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details
            .map((el) => el.message)
            .join(",");
        throw new ExpressError(
            400,
            errMsg
        );
    }
    next();
};

// Validate Review

module.exports.validateReview = (req, res, next) => {

    let { error } = reviewSchema.validate(req.body);

    if (error) {

        let errMsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new ExpressError(
            400,
            errMsg
        );
    }

    next();
};

// Check Review Author

module.exports.isReviewAuthor = async (req, res, next) => {

    let {
        id,
        reviewId
    } = req.params;

    let review = await Review.findById(reviewId);

    if (!review) {

        req.flash(
            "error",
            "Review not found!"
        );

        return res.redirect(
            `/listings/${id}`
        );
    }

    if (!req.user) {

        req.flash(
            "error",
            "Please login first!"
        );

        return res.redirect("/login");
    }

    if (!review.author.equals(req.user._id)) {

        req.flash(
            "error",
            "You are not the author of this review."
        );

        return res.redirect(
            `/listings/${id}`
        );
    }

    next();
};