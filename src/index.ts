import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

import ownerRouter from '../routes/owner'
import fleetRouter from '../routes/fleet'
import vehicleRouter from '../routes/vehicle'
import telemetryRouter from '../routes/telemetry'
import alertRouter from '../routes/alert'
import analyticsRouter from '../routes/analytics'
app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173' }));

app.use('/owner',ownerRouter);
app.use('/fleet',fleetRouter);
app.use('/vehicle',vehicleRouter);
app.use('/telemetry',telemetryRouter);
app.use('/alert', alertRouter);
// also expose plural endpoint for SSE and alerts
app.use('/alerts', alertRouter);
app.use('/analytics',analyticsRouter)

app.get('/', (req: Request, res: Response) => {
  res.send("ok")
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
