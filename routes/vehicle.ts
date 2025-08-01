import { Router, Request, Response } from 'express';
import prisma from '../utils/prismaClient'

const router = Router();

router.post("/create", async (req: Request,res: Response) => {
    const {vin,manufacturer,model,fleetID,registrationStatus} = req.body;
    // console.log(vin);
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
        res.json(vehicle);
    } catch (error){
        console.log(error);
        res.json(error);
    }
});

router.get("/getVehicle", async (req: Request,res: Response) => {
    const vin : number = Number(req.query.vin);
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: {vin}
        })
        res.json(vehicle);
    } catch (error){
        console.log(error);
        res.json(error);
    }
})

router.delete("/deleteVehicle",async(req:Request,res: Response) => {
    const vehicleVin = Number(req.body.vehicleVin);
    try {
        const vehicle = await prisma.vehicle.delete({
            where : {vin:vehicleVin}
        })
        res.json(vehicle);
    } catch (error){
        console.log(error);
        res.json(error);
    }
})

router.get("/list",async(req:Request,res: Response) => {
    try {
        const vehicleList = await prisma.vehicle.findMany();
        res.json(vehicleList);
    } catch (error){
        console.log(error);
        res.json(error);
    }
})

export default router;
