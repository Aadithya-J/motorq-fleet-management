import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

import ownerRouter from '../routes/owner'
import fleetRouter from '../routes/fleet'
import vehicleRouter from '../routes/vehicle'
import telemetryRouter from '../routes/telemetry'
import alertRouter from '../routes/alert'

app.use(express.json());

app.use('/owner',ownerRouter);
app.use('/fleet',fleetRouter);
app.use('/vehicle',vehicleRouter);
app.use('/telemetry',telemetryRouter);
app.use('/alert',alertRouter);

app.get('/', (req: Request, res: Response) => {
  res.send("ok")
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
