import RequestModel from '../models/requestModel';
import Debate from '../models/debateModel';
import Notification from '../models/notificationModel';
import User from '../models/userModel';

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//
// export const createRequest = (req, res) => {
//   const post = new RequestModel();
//   post.numRequests = 1;
//   post.topic = req.body.topic;
//   post.person1 = req.body.person1;
//   post.person2 = req.body.person2;
//   post.date = new Date();
//   post.person1Email = req.body.person1Email;
//   post.person2Email = req.body.person2Email;
//   post.requestUsers = [{ email: req.body.requesterEmail, date: new Date() }]; // not for assignment
//   post.save()
//     .then((result) => {
//       res.json(result);
//     })
//     .catch((error) => {
//       res.status(500).json({ error });
//     //  console.log(error);
//     });
// };

export const createRequestNew = (req, res) => {
  RequestModel.find({
    $or: [{
      person1Email: req.body.person1Email, person2Email: req.body.person2Email, topic: req.body.topic, status: 'ACCEPT_VOTES',
    },
    {
      person1Email: req.body.person1Email, person2Email: req.body.person2Email, topic: req.body.topic, status: 'ACCEPT_VOTES',
    }],
  })
    .then((posts) => {
      if (posts.length === 1) {
        const currpost = posts[0];
        currpost.numRequests += 1;
        currpost.requestUsers.push({ email: req.body.requesterEmail, date: new Date() });
        return currpost.save()
          .then((post) => {
            res.send(post);
          })
          .catch((error) => {
            res.status(422).json({ error });
          });
      } else {
        const post = new RequestModel();
        console.log(req.body);
        console.log('Thats the body above');
        post.numRequests = 1;
        post.topic = req.body.topic;
        post.person1 = req.body.person1;
        User.findById(req.body.person1ID)
          .then((person1ID) => {
            person1ID.mostRecentlyRequestedDate = new Date();
            person1ID.save();
          });
        post.person2 = req.body.person2;
        console.log(req.body.person2);
        User.findById(req.body.person2ID)
          .then((person2ID) => {
            console.log('HERE');
            console.log(Date.now);
            person2ID.mostRecentlyRequestedDate = new Date();
            person2ID.save();
          });
        post.date = new Date();
        post.person1Email = req.body.person1Email;
        post.person2Email = req.body.person2Email;
        post.requestUsers = [{ email: req.body.requesterEmail, date: new Date(), userID: req.body.requesterID }]; // not for assignment
        post.person1ID = req.body.person1ID;
        post.person2ID = req.body.person2ID;
        //  console.log(post);
        return post.save()
          .then((result) => {
          //  console.log(result);
            const debate = new Debate();
            // console.log('I am now trying to get the debate ID');
            // console.log(result._id);

            debate.requestID = result._id;
            debate.person1Email = result.person1Email;
            debate.person2Email = result.person2Email;
            debate.person1ID = result.person1ID;
            debate.person2ID = result.person2ID;

            const msg1 = {
              from: 'theforumnotifications@gmail.com',
              templateId: 'd-93185f803f6b41cd883438b4705ac321',
              to: result.person1Email,
            };

            const msg2 = {
              from: 'theforumnotifications@gmail.com',
              templateId: 'd-93185f803f6b41cd883438b4705ac321',
              to: result.person2Email,
            };

            sgMail.send(msg1).then((res) => {
              console.log(res);
            }).catch((error) => {
              console.log(error);
            });

            sgMail.send(msg2).then((res) => {
              console.log(res);
            }).catch((error) => {
              console.log(error);
            });

            return debate.save()
              .then((result2) => {
                // console.log(result);
                // console.log(result2);
                const notification1 = new Notification();
                notification1.debateID = result2._id;
                notification1.type = 'REQUESTED';
                notification1.message = `You have been requested to debate ${result.person2}`;
                notification1.userID = result.person1ID;
                notification1.save().then((result3) => {
                  const notification2 = new Notification();
                  notification2.debateID = result2._id;
                  notification2.type = 'REQUESTED';
                  notification2.message = `You have been requested to debate ${result.person1}`;
                  notification2.userID = result.person2ID;
                  notification2.save().then((result4) => {
                    res.json(result2);
                  });
                });
              })
              .catch((error) => {
                res.status(500).json({ error });
              });
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};


export const getRequests = (req, res) => {
  RequestModel.find({ status: 'ACCEPT_VOTES' }, null, { sort: { numRequests: -1 } }).limit(5).populate('person1ID').populate('person2ID')
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const getRequestsByVotes = (req, res) => {
  RequestModel.find({ status: 'ACCEPT_VOTES' }, null, { sort: { numRequests: -1, created_at: -1 } }).limit(4)
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const addVote = (req, res) => {
  RequestModel.findById(req.params.id)
    .then((post) => {
      post.numRequests += 1;
      post.requestUsers.push({ email: req.body.email, date: new Date(), userID: req.body.userID });
      return post.save();
    })
    .then((post) => {
      res.send(post);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};

export const getRequestsForUser = (req, res) => {
  RequestModel.find({ $or: [{ person1Email: req.body.email }, { person2Email: req.body.email }] }).limit(5)
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// export const getPost = (req, res) => {
//   Post.findById(req.params.id).populate('author')
//     .then((post) => {
//       res.json(post);
//     })
//     .catch((error) => {
//       res.status(500).json({ error });
//     });
// };
//
// export const deletePost = (req, res) => {
//   Post.remove({ _id: req.params.id })
//     .then((post) => {
//       res.json({ message: 'delete success' });
//     })
//     .catch((error) => {
//       res.status(500).json({ error });
//     });
// };
//
