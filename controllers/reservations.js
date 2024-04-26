const Reservation = require("../models/Reservation");
const Restaurant = require("../models/Restaurant");

//@desc     Get all reservations
//@routes   GET /api/v1/reservations
//@access   Private
exports.getReservations = async (req, res, next) => {
  let query;

  if (req.user.role !== "admin") {
    query = Reservation.find({ user: req.user.id }).populate({
      path: "restaurant",
      select: "name address tel openTime closeTime",
    });
  } else {
    query = Reservation.find().populate({
      path: "restaurant",
      select: "name address tel openTime closeTime",
    });
  }

  try {
    const reservations = await query;

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Get a single reservation
//@routes   GET /api/v1/reservations/:id
//@access   Private
exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: "restaurant",
      select: "name address tel openTime closeTime",
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `Reservation not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Create a new reservation
//@routes   POST /api/v1/reservations/:restaurantId
//@access   Private
exports.addReservation = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    req.body.restaurant = req.params.restaurantId;

    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: `Cannot find Restaurant with id of ${req.params.restaurantId}`,
      });
    }

    const existingReservations = await Reservation.find({ user: req.user.id });

    if (existingReservations.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `${req.user.id} has already booked 3 reservations`,
      });
    }

    const reservation = await Reservation.create(req.body);

    res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Update reservation by ID
//@routes   PUT /api/v1/reservations/:id
//@access   Private (both)
exports.updateReservation = async (req, res, next) => {
  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `Reservation not found with id of ${req.params.id}`,
      });
    }

    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this reservation`,
      });
    }

    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Delete reservation by ID
//@routes   DELETE /api/v1/reservations/:id
//@access   Private (both)
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `Reservation not found with id of ${req.params.id}`,
      });
    }

    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this reservation`,
      });
    }

    await reservation.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Get all reservations (admin)
//@routes   GET /api/v1/reservations/admin/all
//@access   Private (admin)
exports.getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate({
        path: "restaurant",
        select: "name address tel openTime closeTime",
      })
      .populate({
        path: "user",
        select: "name email tel",
      });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Update reservation by ID (admin)
//@routes   PUT /api/v1/reservations/admin/:id
//@access   Private (admin)
exports.updateReservationById = async (req, res, next) => {
  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `Reservation not found with id of ${req.params.id}`,
      });
    }

    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc     Delete reservation by ID (admin)
//@routes   DELETE /api/v1/reservations/admin/:id
//@access   Private (admin)
exports.deleteReservationById = async (req, res, next) => {
    try {
      const reservation = await Reservation.findById(req.params.id);
  
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: `Reservation not found with id of ${req.params.id}`,
        });
      }
  
      // Check if the user is an admin
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
      }
  
      await reservation.remove();
  
      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };
  
