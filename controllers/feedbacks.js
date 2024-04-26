const Feedback = require("../models/Feedback");
const Reservation = require("../models/Reservation");

//@desc     Get all feedbacks
//@routes   GET /api/v1/feedbacks
//@access   Private (admin and user)
exports.getFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find()
      .populate({
        path: "user",
        select: "name",
      })
      .populate({ path: "restaurant", select: "name address tel" });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Get a single feedback
//@routes   GET /api/v1/feedbacks/:id
//@access   Private (admin and user)
exports.getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate({
        path: "user",
        select: "name",
      })
      .populate({ path: "restaurant", select: "name address tel" });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: `Feedback not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Create a new feedback
//@routes   POST /api/v1/restaurants/:restaurantId/feedbacks
//@access   Private (user with reservation)
exports.addFeedback = async (req, res, next) => {
  try {
    let reservation;

    if (req.user.role !== "admin") {
      reservation = await Reservation.findOne({
        user: req.user.id,
        restaurant: req.params.restaurantId,
      });

      if (!reservation) {
        return res.status(400).json({
          success: false,
          message: "Cannot add feedback without a prior reservation",
        });
      }
    }

    const { rating, description } = req.body;

    if (rating && (rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
      });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      restaurant: req.params.restaurantId,
      rating,
      description,
    });

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Update feedback by ID
//@routes   PUT /api/v1/feedbacks/:id
//@access   Private (user and admin)
exports.updateFeedback = async (req, res, next) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: `Feedback not found with id of ${req.params.id}`,
      });
    }

    if (feedback.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this feedback`,
      });
    }

    feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Delete feedback by ID
//@routes   DELETE /api/v1/feedbacks/:id
//@access   Private (user and admin)
exports.deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: `Feedback not found with id of ${req.params.id}`,
      });
    }

    if (feedback.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this feedback`,
      });
    }

    await feedback.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
