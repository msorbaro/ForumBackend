import { Router } from 'express';
import * as Request from './controllers/requestController';
import * as UserController from './controllers/userController';
import * as Debate from './controllers/debateController';
import { requireSignin } from './services/passport';
import signS3 from './services/s3';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

// /your routes will go here
router.post('/signin', requireSignin, UserController.signin);
router.post('/signup', UserController.signup);

router.route('/requests')
  .post(Request.createRequestNew)
  .get(Request.getRequests);

router.route('/requests/:id')
  .put(Request.addVote);

router.route('/requestsByVotes')
  .get(Request.getRequestsByVotes);


router.route('/getPending')
  .get(UserController.getPendingStatus);

router.route('/getUser')
  .post(UserController.getUserByEmail);

router.route('/getApproved')
  .get(UserController.getApprovedUsers);

router.route('/getPending/:id')
  .put(UserController.updateStatus);

router.route('/getUserRequests')
  .post(Request.getRequestsForUser);

router.route('/debates')
  .post(Debate.createDebate)
  .get(Debate.getDebates);

router.route('/userDebates')
  .post(Debate.getPendingDebatesForUser);

router.route('/editDebateStatus/:id')
  .put(Debate.changePersonsDebateStatus);

router.route('/userRejectedDebates')
  .post(Debate.getForfittedDebatesForUser);

router.route('/userCompletedDebates')
  .post(Debate.getCompletedDebatesForUser);

router.route('/userActiveDebates')
  .post(Debate.getActiveDebatesForUser);

router.route('/oneDebate/:id')
  .get(Debate.getOneDebate)
  .put(Debate.goToNextDebateRound)
  .post(Debate.addDebateVote);

router.get('/sign-s3', signS3);

router.route('/userDebateLikes/:id')
  .put(Debate.checkIfUserLikesDebate)

export default router;
