const express = require('express');
const storeController = require('../controllers/storeController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { ROLES } = require('../utils/roles');
const {
  rateStoreValidator,
  storeIdParamValidator,
  listQueryValidator,
} = require('../validators/storeValidators');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(ROLES.USER), listQueryValidator, validate, storeController.listStores);
router.get(
  '/:id',
  authorize(ROLES.USER, ROLES.ADMIN),
  storeIdParamValidator,
  validate,
  storeController.getStoreById
);
router.post('/:id/rating', authorize(ROLES.USER), rateStoreValidator, validate, storeController.rateStore);

module.exports = router;
