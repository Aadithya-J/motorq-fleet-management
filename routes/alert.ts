import { Router, Request, Response } from 'express';
import prisma from '../utils/prismaClient'

const router = Router();


router.get('/getAlerts',async(req:Request,res:Response) => {
    try {
        const alerts = await prisma.alert.findMany();
        res.json(alerts);
    } catch (error) { 
        console.log(error);
        res.json(error);
    }
});

router.get('/getAlertById',async(req:Request,res:Response) => {
    const alertId = Number(req.query.alertId);
    try {
        const alert = await prisma.alert.findUnique({
            where : {id:alertId},
            include : {
                telemetry : true
            }
        })
        res.json(alert);
    } catch (error){
        console.log(error);
        res.json(error);
    }
});

export default router;