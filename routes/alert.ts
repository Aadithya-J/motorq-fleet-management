import { Router, Request, Response } from 'express';
import cors from 'cors';
import prisma from '../utils/prismaClient';
import redisClient from '../utils/redisClient';
import { createClient } from 'redis';

const router = Router();


router.get('/getAlerts',async(req:Request,res:Response) => {
    const cacheKey = 'alerts:all';
    try {
        const cachedAlerts = await redisClient.get(cacheKey);
        if (cachedAlerts) {
            return res.json(JSON.parse(cachedAlerts));
        }
        const alerts = await prisma.alert.findMany();
        await redisClient.set(cacheKey, JSON.stringify(alerts));
        res.json(alerts);
    } catch (error) { 
        console.log(error);
        res.json(error);
    }
});

router.get('/getAlertById',async(req:Request,res:Response) => {
    const alertId = Number(req.query.alertId);
    const cacheKey = `alert:${alertId}`;
    try {
        const cachedAlert = await redisClient.get(cacheKey);
        if (cachedAlert) {
            return res.json(JSON.parse(cachedAlert));
        }
        const alert = await prisma.alert.findUnique({
            where : {id:alertId},
            include : {
                telemetry : true
            }
        })
        if (alert) {
            await redisClient.set(cacheKey, JSON.stringify(alert));
        }
        res.json(alert);
    } catch (error){
        console.log(error);
        res.json(error);
    }
});

router.get('/getAlertByVehicleId',async(req:Request,res:Response) => {
    const vin = Number(req.query.vin);
    const cacheKey = `alerts:vehicle:${vin}`;
    try {
        const cachedAlerts = await redisClient.get(cacheKey);
        if (cachedAlerts) {
            return res.json(JSON.parse(cachedAlerts));
        }
        const alerts = await prisma.alert.findMany({
            where : {vehicleid:vin},
            include : {
                telemetry : true
            }
        });
        if (alerts) {
            await redisClient.set(cacheKey, JSON.stringify(alerts));
        }
        res.json(alerts);
    } catch (error){
        console.log(error);
        res.json(error);
    }
});

// SSE stream endpoint for real-time alerts
// SSE stream endpoint for real-time alerts
router.get('/stream', cors({ origin: 'http://localhost:5173' }), async (req: Request, res: Response) => {
  // allow CORS for this route
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const subscriber = createClient({ url: process.env.REDIS_URL });
  subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
  await subscriber.connect();

  await subscriber.subscribe('alerts', (message: string) => {
    res.write(`data: ${message}\n\n`);
  });

  req.on('close', async () => {
    await subscriber.unsubscribe('alerts');
    await subscriber.quit();
  });
});

export default router;