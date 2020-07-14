import Debate from '../models/debateModel';
import RequestModel from '../models/requestModel';
import Notification from '../models/notificationModel';

export const createDebate = (req, res) => {
  const debate = new Debate();
  debate.requestID = req.body.requestID;
  debate.save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
    //  console.log(error);
    });
};


export const getDebates = (req, res) => {
  Debate.find({ overallStatus: 'COMPLETED' }, null, { sort: { numRequests: -1 } }).limit(10).populate({
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
//  console.log(req.body.email);
  Debate.find({ $or: [{ person1Email: req.body.email, person1Status: 'PENDING' }, { person2Email: req.body.email, person2Status: 'PENDING' }] }).populate({
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
      // console.log('in here');
      // console.log(posts);
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
      if (post.person1Status !== 'PENDING' && post.person2Status !== 'PENDING') {
        RequestModel.findById(post.requestID).then((request)=>{
          request.status = "NO_LIKES"
          return request.save();
        }).catch((error) => {
            res.status(422).json({ error });
          });

        if (post.person1Status === 'REJECTED' || post.person2Status === 'REJECTED') {
          post.overallStatus = 'REJECTED';
        } else {
          post.overallStatus = 'PENDING_VIDEO';
        }
      }
      return post.save();
    })
    .then((post) => {
      console.log(post)
      if(post.overallStatus === 'PENDING_VIDEO'){
        const notification = new Notification();
        notification.debateID = post._id;
        notification.type = "YOUR_TURN";
        notification.message = "Its your turn to debate!";
        if(post.person1Email === post.personAcceptedFirst){
          notification.userID = post.person1ID;
        }
        else {
          notification.userID = post.person2ID;
        }
        return notification.save().then((notification)=>{
          res.send(post);
        })
      }
      res.send(post);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};


export const getForfittedDebatesForUser = (req, res) => {
  Debate.find({
    $or: [{ person1Email: req.body.email, person1Status: 'REJECTED' },
      { person2Email: req.body.email, person2Status: 'REJECTED' }],
  }).populate({
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

export const getActiveDebatesForUser = (req, res) => {
  Debate.find({
    $or: [{ person1Email: req.body.email, person1Status: 'ACCEPTED', overallStatus: 'PENDING_ACCEPTANCE' },
      { person2Email: req.body.email, person2Status: 'ACCEPTED', overallStatus: 'PENDING_ACCEPTANCE' },
      { person1Email: req.body.email, person1Status: 'ACCEPTED', overallStatus: 'PENDING_VIDEO' },
      { person2Email: req.body.email, person2Status: 'ACCEPTED', overallStatus: 'PENDING_VIDEO' }],
  }).populate({
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

export const getOneDebate = (req, res) => {
  console.log(req.params.id);
  Debate.findById(req.params.id).populate({
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
    .then((post) => {
      // console.log(post);
      // console.log('this is mypost');
      res.json(post);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const goToNextDebateRound = (req, res) => {
  console.log(req.params.id);
  console.log('here');
  console.log(req.body);
  Debate.findById(req.params.id)
    .then((post) => {
      if (req.body.round === 1) {
        // console.log('went to round 1');
        post.firstVideoLink = req.body.link;
        post.firstVideoLength = req.body.videoLength;
      } else if (req.body.round === 2) {
      //  console.log('went to round 2');
        post.secondVideoLink = req.body.link;
        post.secondVideoLength = req.body.videoLength;
      } else if (req.body.round === 3) {
      //  console.log('went to round 3');
        post.thirdVideoLink = req.body.link;
        post.thirdVideoLength = req.body.videoLength;
      } else if (req.body.round === 4) {
      //  console.log('went to round 4');
        post.fourthVideoLink = req.body.link;
        post.fourthVideoLength = req.body.videoLength;

        post.overallStatus = 'COMPLETED';
      }

      return post.save().then((post) => {
      // console.log('made it to the bottom here');
      // console.log(post);
      var acceptedFirstID =  post.personAcceptedFirst === post.person1Email ? post.person1ID : post.person2ID;
      var acceptedSecondID = post.personAcceptedFirst === post.person2Email ? post.person1ID : post.person2ID;
      //
      // console.log(post);
      // console.log("the whole post")
      // console.log(acceptedFirstID);
      // console.log(acceptedSecondID);
      //
      // console.log(post.person1ID);
      // console.log(post.person2ID);

      // console.log(post.personAcceptedFirst)
      // console.log(post.person2Email)
      // console.log(post.person1Email)

      if(post.personAcceptedFirst === post.person1Email){
        acceptedFirstID = post.person1ID;
        acceptedSecondID = post.person2ID;
      }
      else {
        acceptedSecondID = post.person1ID;
        acceptedFirstID = post.person2ID;
      }

      // console.log(acceptedFirstID);
      // console.log(acceptedSecondID);

      const notification = new Notification();
      if(req.body.round === 1 || req.body.round === 3){
        notification.debateID = post._id;
        notification.type = "YOUR_TURN";
        notification.message = "Its your turn to debate!";
        notification.userID = acceptedSecondID;
        return notification.save().then((result2) => {
          res.send(post);
        })
      }
      else if(req.body.round === 2) {
        notification.debateID = post._id;
        notification.type = "YOUR_TURN";
        notification.message = "Its your turn to debate!";
        notification.userID = acceptedFirstID;
        return notification.save().then((result2) => {
          res.send(post);
        })
      }
      else {
        res.send(post);
      }
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
  })
};

export const getCompletedDebatesForUser = (req, res) => {
  // console.log(req.body.email);
  Debate.find({ $or: [{ person1Email: req.body.email, overallStatus: 'COMPLETED' }, { person2Email: req.body.email, overallStatus: 'COMPLETED' }] }).populate({
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
      // console.log('in here');
      // console.log(posts);
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const addDebateVote = (req, res) => {
  Debate.findById(req.params.id)
    .then((post) => {
      // console.log(post);
      // console.log(req.body.email);
      // console.log(req.body.section);
      // console.log(req.body.time);
      post.videoLikes.push({
        email: req.body.email,
        date: new Date(),
        section: req.body.section,
        time: req.body.time,
      });

      // console.log(post.videoLikes)
      return post.save();
    })
    .then((post) => {
      res.send(post);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};

// export const checkIfUserLikesDebate = (req, res) => {
//   // console.log(req.body.email)
//   // console.log("^ above is email")
//   // console.log(req.params.id)
//   Debate.find({
//     _id: req.params.id,
//     videoLikes: {
//       $elemMatch: {
//         email: req.body.email,
//       }
//     }
// })
//   .then((debates)=> {
//     console.log(debates);
//     res.send(debates);
//   })
//   .catch((error) => {
//         res.status(422).json({ error });
//       });
// };

export const getSection1Likes = (req, res) => {
  Debate.find({
    _id: req.params.id,
    videoLikes: {
      $elemMatch: {
        section: 1,
      }
    }
})
  .then((debates)=> {
    res.send(debates);
  })
  .catch((error) => {
        res.status(422).json({ error });
      });
};

export const getSection2Likes = (req, res) => {
  Debate.find({
    _id: req.params.id,
    videoLikes: {
      $elemMatch: {
        section: 2,
      }
    }
})
  .then((debates)=> {
    res.send(debates);
  })
  .catch((error) => {
        res.status(422).json({ error });
      });
};

export const getSection3Likes = (req, res) => {
  Debate.find({
    _id: req.params.id,
    videoLikes: {
      $elemMatch: {
        section: 3,
      }
    }
})
  .then((debates)=> {
    res.send(debates);
  })
  .catch((error) => {
        res.status(422).json({ error });
      });
};

export const getSection4Likes = (req, res) => {
  Debate.find({
    _id: req.params.id,
    videoLikes: {
      $elemMatch: {
        section: 4,
      }
    }
})
  .then((debates)=> {
    res.send(debates);
  })
  .catch((error) => {
        res.status(422).json({ error });
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
