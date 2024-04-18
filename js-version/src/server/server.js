import express from 'express'
import cors from 'cors'

import {query} from './query_db.js'

const app = express();
const port = 3000;
// Enable CORS for all routes
app.use(cors());
app.use(express.json())
// Define a sample route
app.get('/', (req, res) => {
  res.send('Hello, Express.js with CORS!');
});

app.post('/query', async (req, res) => {
    const question = req.body.question
  const ans = await query(question)
    res.json(ans)
})
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
