import { Router } from 'express';
import * as Request from './controllers/requestController';
import * as UserController from './controllers/userController';
import * as Debate from './controllers/debateController';
import * as DebateLike from './controllers/debateLikeController';
import * as Notification from './controllers/notificationController';
import * as Topic from './controllers/topicController';

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

router.route('/addUserPhoto/:id')
  .put(UserController.updatePhoto);

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
  .post(DebateLike.createDebateLike);

router.route('/testingAPI/:id')
  .post(Debate.goToNextRoundWithAPI);

router.route('/concatVideo/:id')
  .post(Debate.concatVideoFinished);

router.route('/addConcatVidLink/:id')
  .post(Debate.addConcatVidLink);

router.get('/sign-s3', signS3);

router.route('/userDebateLikes/:id')
  .put(DebateLike.getUserLikesForVideo);

router.route('/section1DebateLikes/:id')
  .put(DebateLike.getSection1Likes);

router.route('/section2DebateLikes/:id')
  .put(DebateLike.getSection2Likes);

router.route('/section3DebateLikes/:id')
  .put(DebateLike.getSection3Likes);

router.route('/section4DebateLikes/:id')
  .put(DebateLike.getSection4Likes);

router.route('/allDebateLikes/:id')
  .put(DebateLike.getAllVideoLikes);

router.route('/addDebateView/:id')
  .put(Debate.addView);

router.route('/notifications')
  .post(Notification.createNotification);

router.route('/notifications/:id')
  .put(Notification.markNotificationAsRead);

router.route('/getNewRequestsNotifications')
  .put(Notification.getNewRequestNotificationsForUser);

router.route('/getYourTurnNotifications')
  .put(Notification.getYourTurnNotificationsForUser);

router.route('/notificationDashboard/:id')
  .get(Notification.getDashboardNotificationsForUser);

router.route('/notificationDashboardUnseen/:id')
  .get(Notification.getDashboardNotificationsForUserUnseen);

router.route('/updateProfile/:id')
  .put(UserController.updateProfile);

router.route('/topics/')
  .post(Topic.createTopic)
  .get(Topic.getTopTen);

export default router;
