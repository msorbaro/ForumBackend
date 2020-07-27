import Topic from '../models/topicsModel';

export const createTopic = (req, res) => {
  const topic = new Topic();
  topic.topic = req.body.topic;
  topic.save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
    //  console.log(error);
    });
};

export const getTopTen = (req, res) => {
  Topic.find().sort({ dateLastRequested: -1 }).limit(10)
    .then((topics) => {
      res.send(topics);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};
