import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;


import vehicleRouter from '../routes/vehicle'
import telemetryRouter from '../routes/telemetry'

app.use(express.json());


app.use('/vehicle',vehicleRouter);
app.use('/telemetry',telemetryRouter);


app.get('/', (req: Request, res: Response) => {
  res.send("ok")
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
