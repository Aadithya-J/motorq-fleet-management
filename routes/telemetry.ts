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

router.post("/multipleData", async (req: Request, res: Response) => {
    const telemetries = req.body.telemetries;
    console.log(telemetries);
    const telemetryResult : any = [];
    // console.log("start")
    for (var i = 0;i < telemetries.length;i++){
        const telemetry = telemetries[i];
        const { latitude,longitude,engineStatus,errorCode} = telemetry;
        const speed = parseFloat(telemetry.speed);
        const fuelPercentage = parseFloat(telemetry.fuelPercentage);
        const odometerReading = Number(telemetry.odometerReading);
        const timestamp = new Date(telemetry.timestamp);
        const vehicleVin = Number(telemetry.vehicleVin);
        const telemetryRes = await prisma.telemetry.create({
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
        telemetryResult.push(telemetryRes);
        console.log(telemetryRes);
        // console.log("complete1");
    }
    // console.log("complete");
    res.json(telemetryResult);
})

export default router;