import { JobModel } from "../models/jobModel.js";
import { sendWebhook } from "../services/webhookService.js";

export const JobController = {
  async createJob(req, res) {
    try {
      const { taskName, payload, priority } = req.body;

      if (!taskName || !priority)
        return res.status(400).json({ message: "Missing fields" });

      const jobId = await JobModel.create({ taskName, payload, priority });

      res.status(201).json({ jobId, message: "Job created successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getJobs(req, res) {
    try {
      const { status, priority } = req.query;
      const jobs = await JobModel.findAll({ status, priority });
      // Ensure payload is parsed to object when returned
      const parsed = jobs.map((j) => {
        try {
          return { ...j, payload: typeof j.payload === 'string' ? JSON.parse(j.payload) : j.payload };
        } catch (e) {
          return { ...j, payload: j.payload };
        }
      });
      res.json(parsed);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getJob(req, res) {
    try {
      const job = await JobModel.findById(req.params.id);
      if (!job) return res.status(404).json({ message: "Job not found" });

      try {
        job.payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;
      } catch (e) {
        job.payload = job.payload;
      }
      res.json(job);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async runJob(req, res) {
    try {
      const id = req.params.id;
      const job = await JobModel.findById(id);

      if (!job) return res.status(404).json({ message: "Job not found" });

      await JobModel.updateStatus(id, "running");

      res.json({ message: "Job started..." });

      // Simulate background work (3 sec)
      setTimeout(async () => {
        await JobModel.markCompleted(id);

        // Send webhook
        await sendWebhook({
          jobId: id,
          taskName: job.taskName,
          priority: job.priority,
          payload: typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload,
          completedAt: new Date(),
        });
      }, 3000);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
