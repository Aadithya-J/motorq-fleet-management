import { Router, Request, Response } from 'express';
import prisma from '../utils/prismaClient';
import redisClient from '../utils/redisClient';

const router = Router();

router.post("/create", async (req: Request,res: Response) => {
    const {vin,manufacturer,model,registrationStatus} = req.body;
    // console.log(vin);
    const fleetID = Number(req.body.fleetID);
    try {
        const vehicle = await prisma.vehicle.create({
            data: {
                vin,
                manufacturer,
                model,
                fleetID,
                registrationStatus
            }
        })
        await redisClient.del('vehicles:all');
        res.json(vehicle);
    } catch (error){
        console.log(error);
        res.json(error);
    }
});

router.get("/getVehicle", async (req: Request,res: Response) => {
    const vin : number = Number(req.query.vin);
    const cacheKey = `vehicle:${vin}`;
    try {
        const cachedVehicle = await redisClient.get(cacheKey);
        if (cachedVehicle) {
            return res.json(JSON.parse(cachedVehicle));
        }

        const vehicle = await prisma.vehicle.findUnique({
            where: {vin}
        })

        if (vehicle) {
            await redisClient.set(cacheKey, JSON.stringify(vehicle));
        }

        res.json(vehicle);
    } catch (error){
        console.log(error);
        res.json(error);
    }
})

router.delete("/deleteVehicle",async(req:Request,res: Response) => {
    const vehicleVin = Number(req.body.vehicleVin);
    const cacheKey = `vehicle:${vehicleVin}`;
    try {
        const vehicle = await prisma.vehicle.delete({
            where : {vin:vehicleVin}
        })
        await redisClient.del(cacheKey);
        await redisClient.del('vehicles:all');
        res.json(vehicle);
    } catch (error){
        console.log(error);
        res.json(error);
    }
})

router.get("/list",async(req:Request,res: Response) => {
    const cacheKey = 'vehicles:all';
    try {
        const cachedVehicles = await redisClient.get(cacheKey);
        if (cachedVehicles) {
            return res.json(JSON.parse(cachedVehicles));
        }

        const vehicleList = await prisma.vehicle.findMany();
        await redisClient.set(cacheKey, JSON.stringify(vehicleList));
        res.json(vehicleList);
    } catch (error){
        console.log(error);
        res.json(error);
    }
})

export default router;
