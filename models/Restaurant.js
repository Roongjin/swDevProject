const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
    },
    openTime: {
      type: String,
      required: [true, "Please add open time"],
      validate: {
        validator: (v) => {
          return /([01]?[0-9]|2[0-3]):[0-5][0-9]/.test(v);
        },
        message: (props) => `${props.value} is not a valid time`,
      },
    },
    closeTime: {
      type: String,
      required: [true, "Please add close time"],
      validate: {
        validator: (v) => {
          return /([01]?[0-9]|2[0-3]):[0-5][0-9]/.test(v);
        },
        message: (props) => `${props.value} is not a valid time`,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade delete reservations when a restaurant is deleted
RestaurantSchema.pre("deleteOne", { document: true, query: false }, async function (
  next
) {
  console.log(`Reservations being removed from restaurant ${this._id}`);
  await this.model("Reservation").deleteMany({ restaurant: this._id });
  await this.model("Feedback").deleteMany({ restaurant: this._id });
  next();
});

// Reverse populate with virtuals
RestaurantSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "restaurant",
  justOne: false,
});

RestaurantSchema.virtual("feedbacks", {
  ref: "Feedback",
  localField: "_id",
  foreignField: "restaurant",
  justOne: false,
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
