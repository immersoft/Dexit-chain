const mongoose = require("mongoose");

const validatorDetails = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  }
});

mongoose.model("ValidatorInfo", validatorDetails);
