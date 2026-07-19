const express = require('express');
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { ROLES } = require('../utils/roles');
const {
  createUserValidator,
  createStoreValidator,
  userIdParamValidator,
  listQueryValidator,
  updateStatusValidator,
} = require('../validators/adminValidators');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', adminController.dashboard);

router.get('/users', listQueryValidator, validate, adminController.listUsers);
router.post('/users', createUserValidator, validate, adminController.createUser);
router.get('/users/:id', userIdParamValidator, validate, adminController.getUserById);
router.patch('/users/:id/status', updateStatusValidator, validate, adminController.updateUserStatus);

router.get('/stores', listQueryValidator, validate, adminController.listStores);
router.post('/stores', createStoreValidator, validate, adminController.createStore);
router.patch('/stores/:id/status', updateStatusValidator, validate, adminController.updateStoreStatus);

module.exports = router;
