const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cors = require("cors");
const ValidatorInfo=mongoose.model("ValidatorInfo");

router.use(express.json({ extended: false }));

router.post("/validatorEntry", (req, res) => {
    const { address, name, description,website } = req.body;
  
    if (!address || !name  || !description || !website) {
      return res.status(422).json({ error: "Please Fill the details" });
    }
  
    ValidatorInfo.findOne({ address: address }).then((saveduser) => {
      if (saveduser) {
          console.log(saveduser)
        return res.status(422).json({ error: "User already exists" });
      }
      const info = new ValidatorInfo({
        address,
        name,
        description,
        website
      });
  
      info
        .save()
        .then((user) => {
          res.status(200).json({ message: "saved successfully" });
        })
        .catch((err) => {
          res.status(400).json({ error: err });
        });
    });
  });

router.get("/validatorInfo/:address", (req, res) => {
    ValidatorInfo.findOne({ address: req.params.address })
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.json(err);
      });
});

module.exports = router;