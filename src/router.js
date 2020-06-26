import { Router } from 'express';
import * as Request from './controllers/requestController';


const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

// /your routes will go here

router.route('/requests')
  .post(Request.createRequest)
  .get(Request.getRequests);

export default router;
