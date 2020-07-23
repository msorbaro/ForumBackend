// import axios from 'axios';
import Debate from '../models/debateModel';
import RequestModel from '../models/requestModel';
import Notification from '../models/notificationModel';

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Transloadit = require('transloadit');

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
  Debate.find({ overallStatus: 'FINAL' }, null, { sort: { numRequests: -1 } }).limit(10).populate({
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
      console.log(post);
      console.log('MADE IT IN HERE');

      let text = '';
      if (req.body.status === 'REJECTED') {
        text = 'rejected';
      } else if (req.body.status === 'ACCEPTED') {
        text = 'accepted';
      }

      console.log(`this is text: ${text}`);
      if (req.body.email === post.person1Email) {
        post.person1Status = req.body.status;

        RequestModel.findById(post.requestID).then((request) => {
          console.log('found something');
          for (let i = 0; i < request.requestUsers.length; i += 1) {
            console.log(request.requestUsers[i]);
            const notification = new Notification();
            notification.debateID = post._id;
            notification.userID = request.requestUsers[i].userID;
            notification.type = 'ACCEPTED_DEBATE';
            notification.message = `The debate you requested between ${request.person1} and ${request.person2} is has been ${text} by ${request.person1}!`;
            notification.save();
          }
        }).catch((error) => {
          res.status(422).json({ error });
        });
      } else if (req.body.email === post.person2Email) {
        post.person2Status = req.body.status;
        RequestModel.findById(post.requestID).then((request) => {
          console.log('found something');
          for (let i = 0; i < request.requestUsers.length; i += 1) {
            console.log(request.requestUsers[i]);
            const notification = new Notification();
            notification.debateID = post._id;
            notification.userID = request.requestUsers[i].userID;
            notification.type = 'ACCEPTED_DEBATE';
            notification.message = `The debate you requested between ${request.person1} and ${request.person2} is has been ${text} by ${request.person2}!`;
            notification.save();
          }

          console.log('Made it to this part');
        }).catch((error) => {
          res.status(422).json({ error });
        });
      }
      if (post.personAcceptedFirst === '') {
        post.personAcceptedFirst = req.body.email;
      }
      if (post.person1Status !== 'PENDING' && post.person2Status !== 'PENDING') {
        RequestModel.findById(post.requestID).then((request) => {
          request.status = 'NO_LIKES';
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
      console.log(post);
      if (post.overallStatus === 'PENDING_VIDEO') {
        const notification = new Notification();
        notification.debateID = post._id;
        notification.type = 'YOUR_TURN';
        notification.message = 'Its your turn to debate!';
        const msg = {
          // to: 'recipient@example.org',
          from: 'dsorbaro@theforum.tv',
          templateId: 'd-14c325a539f6419fae9ae3bf36df25ff',
          dynamicTemplateData: {
            // subject: 'Testing Templates',
            // name: 'Some One',
            link: `https://forum-breakthenews.web.app/createDebate/${post._id}`,
          },
        };
        if (post.person1Email === post.personAcceptedFirst) {
          notification.userID = post.person1ID;
          msg.to = post.person1Email;
        } else {
          notification.userID = post.person2ID;
          msg.to = post.person2Email;
        }

        sgMail.send(msg).then((res) => {
          console.log(res);
        }).catch((error) => {
          console.log(error);
        });
        return notification.save().then((notification) => {
          res.send(post);
        });
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

export const addConcatVidLink = (req, res) => {
  const jsonresult = JSON.parse(req.body.transloadit);
  const debateID = req.params.id;

  Debate.findById(debateID)
    .then((debate) => {
      debate.overallStatus = 'FINAL';
      debate.finalVideoLink = jsonresult.results.concatenate_videos[0].ssl_url;
      debate.finalVideoLength = jsonresult.results.concatenate_videos[0].meta.duration;
      return debate.save();
    });
  res.send('200');
};


export const concatVideoFinished = (req, res) => {
  console.log('Made this here');
  const jsonresult = JSON.parse(req.body.transloadit);
  console.log(jsonresult);
};

export const goToNextRoundWithAPI = (req, res) => {
  const jsonresult = JSON.parse(req.body.transloadit);
  const debateID = req.params.id;
  // console.log(jsonresult);
  const videoLink = jsonresult.results.video_webm[0].ssl_url;
  const videoLength = jsonresult.results.video_webm[0].meta.duration;
  // console.log(videoLink);
  // console.log(videoLength);
  let round = 0;

  Debate.findById(debateID)
    .then((debate) => {
      if (debate.thirdVideoLink !== '') {
        // console.log('went to round 4');
        debate.fourthVideoLink = videoLink;
        debate.fourthVideoLength = videoLength;
        round = 4;

        const transloadit = new Transloadit({
          authKey: 'b4f061fc5b5948b2ad5739a92a6f092f',
          authSecret: '6c0f2a84ba9e8c447311674bbff96c869fee3336',
        });

        const options = {
          params: {
            template_id: '0d209cf1e80c473abc65e12caff9c561',
            fields: {
              folder_name: debate._id,
            },
            notify_url: `https://forum-debate.herokuapp.com/api/addConcatVidLink/${debate._id}`,
          },
        };

        transloadit.createAssembly(options, (err, result) => {
          if (err) {
            throw err;
          }
          console.log({ result });
        });

        debate.overallStatus = 'COMPLETED';
      } else if (debate.secondVideoLink !== '') {
      //  console.log('went to round 3');
        debate.thirdVideoLink = videoLink;
        debate.thirdVideoLength = videoLength;
        round = 3;
      } else if (debate.firstVideoLink !== '') {
      //  console.log('went to round 2');
        debate.secondVideoLink = videoLink;
        debate.secondVideoLength = videoLength;
        round = 2;
      } else if (debate.firstVideoLink === '') {
      //  console.log('went to round 1');
        debate.firstVideoLink = videoLink;
        debate.firstVideoLength = videoLength;
        round = 1;
      }

      console.log(round);

      return debate.save()
        .then((post) => {
          let acceptedFirstID = post.personAcceptedFirst === post.person1Email ? post.person1ID : post.person2ID;
          let acceptedSecondID = post.personAcceptedFirst === post.person2Email ? post.person1ID : post.person2ID;
          let acceptedSecondEmail = '';
          let acceptedFirstEmail = '';
          if (post.personAcceptedFirst === post.person1Email) {
            acceptedFirstID = post.person1ID;
            acceptedSecondID = post.person2ID;
            acceptedFirstEmail = post.person1Email;
            acceptedSecondEmail = post.person2Email;
          } else {
            acceptedSecondID = post.person1ID;
            acceptedFirstID = post.person2ID;
            acceptedSecondEmail = post.person1Email;
            acceptedFirstEmail = post.person2Email;
          }

          // console.log(acceptedFirstID);
          // console.log(acceptedSecondID);

          // console.log(round);
          const notification = new Notification();

          const msg = {
            // to: 'recipient@example.org',
            from: 'dsorbaro@theforum.tv',
            templateId: 'd-14c325a539f6419fae9ae3bf36df25ff',
            dynamicTemplateData: {
              // subject: 'Testing Templates',
              // name: 'Some One',
              link: `https://forum-breakthenews.web.app/createDebate/${post._id}`,
            },
          };
          if (round === 1 || round === 3) {
            notification.debateID = post._id;
            notification.type = 'YOUR_TURN';
            notification.message = 'Its your turn to debate!';
            notification.userID = acceptedSecondID;
            msg.to = acceptedSecondEmail;
            sgMail.send(msg).then((res) => {
              console.log(res);
            }).catch((error) => {
              console.log(error);
            });

            return notification.save();
          } else if (round === 2) {
            notification.debateID = post._id;
            notification.type = 'YOUR_TURN';
            notification.message = 'Its your turn to debate!';
            notification.userID = acceptedFirstID;
            msg.to = acceptedFirstEmail;
            console.log(msg);

            sgMail.send(msg).then((res) => {
              console.log(res);
            }).catch((error) => {
              console.log(error);
            });

            return notification.save();
          } else {
            RequestModel.findById(post.requestID).then((request) => {
              // console.log('found something');
              // console.log(request.requestUsers.length);
              for (let i = 0; i < request.requestUsers.length; i += 1) {
              //  console.log(request.requestUsers[i]);
                const notification2 = new Notification();
                notification2.debateID = post._id;
                notification2.userID = request.requestUsers[i].userID;
                notification2.type = 'POSTED_DEBATE';
                notification2.message = `The debate you requested between ${request.person1} and ${request.person2} is posted!`;
                notification2.save();
              }
            });
          }
        })
        .catch((error) => {
          res.status(422).json({ error });
        });
    });

  res.send('200');
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
        let acceptedFirstID = post.personAcceptedFirst === post.person1Email ? post.person1ID : post.person2ID;
        let acceptedSecondID = post.personAcceptedFirst === post.person2Email ? post.person1ID : post.person2ID;

        if (post.personAcceptedFirst === post.person1Email) {
          acceptedFirstID = post.person1ID;
          acceptedSecondID = post.person2ID;
        } else {
          acceptedSecondID = post.person1ID;
          acceptedFirstID = post.person2ID;
        }

        // console.log(acceptedFirstID);
        // console.log(acceptedSecondID);

        const notification = new Notification();
        if (req.body.round === 1 || req.body.round === 3) {
          notification.debateID = post._id;
          notification.type = 'YOUR_TURN';
          notification.message = 'Its your turn to debate!';
          notification.userID = acceptedSecondID;
          return notification.save().then((result2) => {
            res.send(post);
          });
        } else if (req.body.round === 2) {
          notification.debateID = post._id;
          notification.type = 'YOUR_TURN';
          notification.message = 'Its your turn to debate!';
          notification.userID = acceptedFirstID;
          return notification.save().then((result2) => {
            res.send(post);
          });
        } else {
          console.log('In else');
          console.log(post.requestID);
          RequestModel.findById(post.requestID).then((request) => {
            console.log('found something');
            for (let i = 0; i < request.requestUsers.length; i++) {
              console.log(request.requestUsers[i]);
              const notification = new Notification();
              notification.debateID = post._id;
              notification.userID = request.requestUsers[i].userID;
              notification.type = 'POSTED_DEBATE';
              notification.message = `The debate you requested between ${request.person1} and ${request.person2} is posted!`;
              notification.save();
            }
          });

          res.send(post);
        }
      })
        .catch((error) => {
          res.status(422).json({ error });
        });
    });
};

export const getCompletedDebatesForUser = (req, res) => {
  // console.log(req.body.email);
  Debate.find({
    $or: [
      { person1Email: req.body.email, overallStatus: 'FINAL' },
      { person2Email: req.body.email, overallStatus: 'FINAL' },
    ],
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
//
// export const getAllVideoLikes = (req, res) => {
//   Debate.find({
//     _id: req.params.id,
//     videoLikes: {
//       $elemMatch: {
//         section: 1,
//       },
//     },
//   })
//     .then((debates) => {
//       res.send(debates);
//     })
//     .catch((error) => {
//       res.status(422).json({ error });
//     });
// };

export const getSection1Likes = (req, res) => {
  Debate.find({
    _id: req.params.id,
    videoLikes: {
      $elemMatch: {
        section: 1,
      },
    },
  })
    .then((debates) => {
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
      },
    },
  })
    .then((debates) => {
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
      },
    },
  })
    .then((debates) => {
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
      },
    },
  })
    .then((debates) => {
      res.send(debates);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};


export const addView = (req, res) => {
  Debate.findById(req.params.id)
    .then((post) => {
      post.videoViews += 1;
      return post.save();
    })
    .then((post) => {
      res.send(post);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};
