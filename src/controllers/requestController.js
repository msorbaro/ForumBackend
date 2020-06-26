import RequestModel from '../models/requestModel';


export const createRequest = (req, res) => {
  console.log('HERE');
  const post = new RequestModel();
  post.numRequests = 0;
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
  RequestModel.find({}, null, { sort: { created_at: -1 } })
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
// export const updatePost = (req, res) => {
//   Post.findById(req.params.id).populate('author')
//     .then((post) => {
//       if (post.author.id === req.user.id) {
//         post.title = (req.body.title) ? req.body.title : post.title;
//         post.tags = (req.body.tags) ? req.body.tags : post.tags;
//         post.content = (req.body.content) ? req.body.content : post.content;
//         post.cover_url = (req.body.cover_url) ? req.body.cover_url : post.cover_url;
//         return post.save();
//       } else {
//         console.log('different authors');
//         throw new Error('you don\'t have permission to edit this post');
//       }
//     })
//     .then((post) => {
//       res.send(post);
//     })
//     .catch((error) => {
//       res.status(422).json({ error });
//     });
// };
