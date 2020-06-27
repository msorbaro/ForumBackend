import { Router } from 'express';
import * as Request from './controllers/requestController';
import * as UserController from './controllers/userController';
import { requireSignin } from './services/passport';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

// /your routes will go here
router.post('/signin', requireSignin, UserController.signin);
router.post('/signup', UserController.signup);

router.route('/requests')
  .post(Request.createRequest)
  .get(Request.getRequests);

router.route('/requests/:id')
  .put(Request.addVote);

router.route('/requestsByVotes')
  .get(Request.getRequestsByVotes);


router.route('/getPending')
  .get(UserController.getPendingStatus);

router.route('/getUser')
  .get(UserController.getUserByEmail);

router.route('/getApproved')
  .get(UserController.getApprovedUsers);

router.route('/getPending/:id')
  .put(UserController.updateStatus);

export default router;
