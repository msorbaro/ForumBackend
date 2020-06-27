import RequestModel from '../models/requestModel';


export const createRequest = (req, res) => {
  console.log('HERE');
  const post = new RequestModel();
  post.numRequests = 1;
  post.topic = req.body.topic;
  post.person1 = req.body.person1;
  post.person2 = req.body.person2;
  post.date = new Date();
  post.requestUsers = [{ email: req.body.requesterEmail, date: new Date() }]; // not for assignment
  console.log('did all tjhis stuff');
  post.save()
    .then((result) => {
      console.log('HERE finalize');
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
      console.log(error);
    });
};

export const getRequests = (req, res) => {
  console.log('here');
  console.log('AGAIN');
  RequestModel.find({}, null, { sort: { numRequests: -1, created_at: -1 } }).limit(5)
    .then((posts) => {
      console.log('here2');
      console.log(posts);
      res.json(posts);
    })
    .catch((error) => {
      console.log('erroring');
      console.log(error);
      res.status(500).json({ error });
    });
};

export const addVote = (req, res) => {
  RequestModel.findById(req.params.id)
    .then((post) => {
      post.numRequests += 1;
      return post.save();
    })
    .then((post) => {
      res.send(post);
    })
    .catch((error) => {
      res.status(422).json({ error });
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
