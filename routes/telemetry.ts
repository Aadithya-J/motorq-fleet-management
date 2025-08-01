import { Router, Request, Response } from 'express';
import prisma from '../utils/prismaClient'

const router = Router();

router.post("/data", async (req: Request,res: Response) => {
    const { latitude,longitude,engineStatus,errorCode} = req.body;
    const speed = parseFloat(req.body.speed);
    const fuelPercentage = parseFloat(req.body.fuelPercentage);
    const odometerReading = Number(req.body.odometerReading);
    const timestamp = new Date(req.body.timestamp);
    const vehicleVin = Number(req.body.vehicleVin)
    try {
        const telemetry = await prisma.telemetry.create({
            data: {
                latitude,
                longitude,
                speed,
                engineStatus,
                fuelPercentage,
                odometerReading,
                errorCode,
                timestamp,
                vehicleVin
            }
        })
        res.json(telemetry);
    } catch (error){
        console.log(error);
        res.json(error);
    }
});

export default router;