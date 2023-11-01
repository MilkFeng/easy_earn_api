const express = require('express');
const { verify_body } = require('../../common/utils.js');
const { passport, db } = require('../../user/passport.js');

const router = express.Router();

module.exports = router;