import Notification from '../models/notificationModel';

export const createNotification = (req, res) => {
  const notification = new Notification();
  notification.debateID = req.body.debateID;
  notification.userID = req.body.userID;
  notification.type = req.body.type;
  notification.message = req.body.message;

  notification.save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
    //  console.log(error);
    });
};

export const markNotificationAsRead = (req, res) => {
  Notification.findById(req.params.id)
    .then((notification) => {
      notification.seenByUser = true;
      return notification.save();
    })
    .then((post) => {
      // console.log('made it to the bottom here');
      // console.log(post);
      res.send(post);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};

export const getNewRequestNotificationsForUser = (req, res) => {
  Notification.find({
    type: "REQUESTED",
    seenByUser: false,
    userID: req.body.userID,
})
  .then((notifications)=> {
    res.send(notifications);
  })
  .catch((error) => {
        res.status(422).json({ error });
      });
};

export const getYourTurnNotificationsForUser = (req, res) => {
  Notification.find({
    type: "YOUR_TURN",
    seenByUser: false,
    userID: req.body.userID,
})
  .then((notifications)=> {
    res.send(notifications);
  })
  .catch((error) => {
        res.status(422).json({ error });
      });
};

export const getDashboardNotificationsForUser = (req, res) => {
  Notification.find({
    userID: req.params.id,
    $or : [{"type":"ACCEPTED_DEBATE"}, {"type":"POSTED_DEBATE"}]
  }, {})
  .then((notifications)=> {
    console.log(notifications)
    res.send(notifications);
  })
  .catch((error) => {
        res.status(422).json({ error });
      });
};

export const getDashboardNotificationsForUserUnseen = (req, res) => {
  Notification.find({
    userID: req.params.id,
    seenByUser: false, 
    $or : [{"type":"ACCEPTED_DEBATE"}, {"type":"POSTED_DEBATE"}]
  }, {})
  .then((notifications)=> {
    console.log(notifications)
    res.send(notifications);
  })
  .catch((error) => {
        res.status(422).json({ error });
      });
};
