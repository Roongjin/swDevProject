const express = require("express");
const {
  getFeedbacks,
  getFeedback,
  addFeedback,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedbacks");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(getFeedbacks)
  .post(protect, authorize("admin", "user"), addFeedback);
router
  .route("/:id")
  .get(getFeedback)
  .put(protect, authorize("admin"), updateFeedback)
  .delete(protect, authorize("admin"), deleteFeedback);

module.exports = router;
