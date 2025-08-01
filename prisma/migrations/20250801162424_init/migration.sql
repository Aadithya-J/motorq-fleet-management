-- CreateEnum
CREATE TYPE "public"."RegistrationStatusType" AS ENUM ('ACTIVE', 'MAINTENANCE', 'DECOMISSIONED');

-- CreateEnum
CREATE TYPE "public"."EngineStatusType" AS ENUM ('ON', 'OFF', 'IDLE');

-- CreateTable
CREATE TABLE "public"."Owner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Fleet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "OwnerId" INTEGER NOT NULL,

    CONSTRAINT "Fleet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vehicle" (
    "vin" SERIAL NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "registrationStatus" "public"."RegistrationStatusType" NOT NULL DEFAULT 'ACTIVE',
    "fleetID" INTEGER NOT NULL,
    "currentAlertCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("vin")
);

-- CreateTable
CREATE TABLE "public"."Telemetry" (
    "id" SERIAL NOT NULL,
    "vehicleVin" INTEGER NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "engineStatus" "public"."EngineStatusType" NOT NULL,
    "fuelPercentage" DOUBLE PRECISION NOT NULL,
    "odometerReading" INTEGER NOT NULL,
    "errorCode" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Alert" (
    "id" SERIAL NOT NULL,
    "alert" TEXT NOT NULL,
    "telemetryid" INTEGER NOT NULL,
    "vehicleid" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vehicle_fleetID_idx" ON "public"."Vehicle"("fleetID");

-- CreateIndex
CREATE INDEX "Telemetry_vehicleVin_idx" ON "public"."Telemetry"("vehicleVin");

-- AddForeignKey
ALTER TABLE "public"."Fleet" ADD CONSTRAINT "Fleet_OwnerId_fkey" FOREIGN KEY ("OwnerId") REFERENCES "public"."Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vehicle" ADD CONSTRAINT "Vehicle_fleetID_fkey" FOREIGN KEY ("fleetID") REFERENCES "public"."Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Telemetry" ADD CONSTRAINT "Telemetry_vehicleVin_fkey" FOREIGN KEY ("vehicleVin") REFERENCES "public"."Vehicle"("vin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alert" ADD CONSTRAINT "Alert_telemetryid_fkey" FOREIGN KEY ("telemetryid") REFERENCES "public"."Telemetry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alert" ADD CONSTRAINT "Alert_vehicleid_fkey" FOREIGN KEY ("vehicleid") REFERENCES "public"."Vehicle"("vin") ON DELETE RESTRICT ON UPDATE CASCADE;
