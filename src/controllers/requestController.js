import RequestModel from '../models/requestModel';
import Debate from '../models/debateModel';


export const createRequest = (req, res) => {
  const post = new RequestModel();
  post.numRequests = 1;
  post.topic = req.body.topic;
  post.person1 = req.body.person1;
  post.person2 = req.body.person2;
  post.date = new Date();
  post.person1Email = req.body.person1Email;
  post.person2Email = req.body.person2Email;
  post.requestUsers = [{ email: req.body.requesterEmail, date: new Date() }]; // not for assignment
  post.save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
      console.log(error);
    });
};

export const createRequestNew = (req, res) => {
  RequestModel.find({
    $or: [{ person1Email: req.body.person1Email, person2Email: req.body.person2Email, topic: req.body.topic },
      { person1Email: req.body.person1Email, person2Email: req.body.person2Email, topic: req.body.topic }],
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
        post.numRequests = 1;
        post.topic = req.body.topic;
        post.person1 = req.body.person1;
        post.person2 = req.body.person2;
        post.date = new Date();
        post.person1Email = req.body.person1Email;
        post.person2Email = req.body.person2Email;
        post.requestUsers = [{ email: req.body.requesterEmail, date: new Date() }]; // not for assignment
        post.person1ID = req.body.person1ID;
        post.person2ID = req.body.person2ID;
        console.log(post);
        return post.save()
          .then((result) => {
            console.log(result);
            const debate = new Debate();
            console.log('I am now trying to get the debate ID');
            console.log(result._id);
            debate.requestID = result._id;
            debate.person1Email = result.person1Email;
            debate.person2Email = result.person2Email;
            return debate.save()
              .then((result2) => {
                res.json(result2);
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
  RequestModel.find({}, null, { sort: { numRequests: -1 } }).limit(5).populate('person1ID').populate('person2ID')
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const getRequestsByVotes = (req, res) => {
  RequestModel.find({}, null, { sort: { numRequests: -1, created_at: -1 } }).limit(4)
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
      post.requestUsers.push({ email: req.body.email, date: new Date() });
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
