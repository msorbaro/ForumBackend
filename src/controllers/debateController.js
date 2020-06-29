import Debate from '../models/debateModel';


export const createDebate = (req, res) => {
  const debate = new Debate();
  debate.requestID = req.body.requestID;
  debate.save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
      console.log(error);
    });
};


export const getDebates = (req, res) => {
  Debate.find({}, null, { sort: { numRequests: -1 } }).populate({
    path: 'requestID',
    populate: {
      path: 'person1ID',
    },
  }).populate({
    path: 'requestID',
    populate: {
      path: 'person2ID',
    },
  })
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const getPendingDebatesForUser = (req, res) => {
  Debate.find({ $or: [{ person1Email: req.body.email, person1Status: 'PENDING' }, { person2Email: req.body.email, person1Status: 'PENDING' }] }).populate({
    path: 'requestID',
    populate: {
      path: 'person1ID',
    },
  }).populate({
    path: 'requestID',
    populate: {
      path: 'person2ID',
    },
  })
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};


export const changePersonsDebateStatus = (req, res) => {
  // console.log(req.params.id);
  // console.log('here');
  Debate.findById(req.params.id)
    .then((post) => {
      // console.log(post);
      // console.log('MADE IT IN HERE');
      if (req.body.email === post.person1Email) {
        post.person1Status = req.body.status;
      } else if (req.body.email === post.person2Email) {
        post.person2Status = req.body.status;
      }
      if (post.personAcceptedFirst === '') {
        post.personAcceptedFirst = req.body.email;
      }
      return post.save();
    })
    .then((post) => {
      res.send(post);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};


export const getForfittedDebatesForUser = (req, res) => {
  Debate.find({ $or: [{ person1Email: req.body.email, person1Status: 'REJECTED' }, { person2Email: req.body.email, person1Status: 'REJECTED' }] }).populate({
    path: 'requestID',
    populate: {
      path: 'person1ID',
    },
  }).populate({
    path: 'requestID',
    populate: {
      path: 'person2ID',
    },
  })
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};


// export const getRequestsByVotes = (req, res) => {
//   RequestModel.find({}, null, { sort: { numRequests: -1, created_at: -1 } }).limit(4)
//     .then((posts) => {
//       res.json(posts);
//     })
//     .catch((error) => {
//       res.status(500).json({ error });
//     });
// };
//
// export const addVote = (req, res) => {
//   RequestModel.findById(req.params.id)
//     .then((post) => {
//       post.numRequests += 1;
//       post.requestUsers.push({ email: req.body.email, date: new Date() });
//       return post.save();
//     })
//     .then((post) => {
//       res.send(post);
//     })
//     .catch((error) => {
//       res.status(422).json({ error });
//     });
// };
//
// export const getRequestsForUser = (req, res) => {
//   RequestModel.find({ $or: [{ person1Email: req.body.email }, { person2Email: req.body.email }] }).limit(5)
//     .then((posts) => {
//       res.json(posts);
//     })
//     .catch((error) => {
//       res.status(500).json({ error });
//     });
// };
