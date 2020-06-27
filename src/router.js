import { Router } from 'express';
import * as Request from './controllers/requestController';
import * as UserController from './controllers/userController';
import { requireAuth, requireSignin } from './services/passport';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

// /your routes will go here
router.post('/signin', requireSignin, UserController.signin);
router.post('/signup', UserController.signup);

router.route('/requests')
  .post(requireAuth, Request.createRequest)
  .get(Request.getRequests);

router.route('/getPending')
  .get(UserController.getPendingStatus)
  .put(UserController.updateStatus);


export default router;
