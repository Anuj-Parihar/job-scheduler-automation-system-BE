import express from "express";
import { JobController } from "../controllers/jobController.js";

const router = express.Router();

router.post("/jobs", JobController.createJob);
router.get("/jobs", JobController.getJobs);
router.get("/jobs/:id", JobController.getJob);
router.post("/run-job/:id", JobController.runJob);

export default router;
