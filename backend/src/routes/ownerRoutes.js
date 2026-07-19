const express = require('express');
const ownerController = require('../controllers/ownerController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { ROLES } = require('../utils/roles');
const { dashboardQueryValidator } = require('../validators/ownerValidators');

const router = express.Router();

router.use(authenticate, authorize(ROLES.OWNER));

router.get('/dashboard', dashboardQueryValidator, validate, ownerController.dashboard);

module.exports = router;
