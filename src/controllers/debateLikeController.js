import DebateLike from '../models/debateLikeModel';
import Debate from '../models/debateModel';


export const createDebateLike = (req, res) => {
  const debateLike = new DebateLike();
  debateLike.videoTime = req.body.videoTime;
  debateLike.debateID = req.body.debateID;
  debateLike.videoSection = req.body.videoSection;
  debateLike.likerID = req.body.likerID;

  debateLike.save()
    .then((result) => {
      Debate.findById(req.body.debateID)
        .then((post) => {
          post.totalVideoLikes += 1;
          return post.save();
        });
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
    //  console.log(error);
    });
};

export const getAllDebateLikes = (req, res) => {
  DebateLike.find({
    debateID: req.params.id,
  })
    .then((debates) => {
      res.send(debates);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};

export const getSection4Likes = (req, res) => {
  DebateLike.find({
    debateID: req.params.id,
    videoSection: 4,
  })
    .then((debates) => {
      res.send(debates);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};

export const getSection3Likes = (req, res) => {
  DebateLike.find({
    debateID: req.params.id,
    videoSection: 3,
  })
    .then((debates) => {
      res.send(debates);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};

export const getSection2Likes = (req, res) => {
  DebateLike.find({
    debateID: req.params.id,
    videoSection: 2,
  })
    .then((debates) => {
      res.send(debates);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};

export const getSection1Likes = (req, res) => {
  DebateLike.find({
    debateID: req.params.id,
    videoSection: 1,
  })
    .then((debates) => {
      res.send(debates);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};

export const getUserLikesForVideo = (req, res) => {
  console.log(req.params.id);
  console.log(req.body.likerID);
  DebateLike.find({
    debateID: req.params.id,
    likerID: req.body.likerID,
  })
    .then((debates) => {
      console.log(debates);
      console.log('in this get user likes for video');
      res.send(debates);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};
