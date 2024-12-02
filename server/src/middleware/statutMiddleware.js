import Status from "../models/statusModel.js";
import { statusSchema, updateStatusSchema } from "../joiSchema/statusSchema.js";

export const setStatusEntity = (req, res, next) => {
  req.entity = Status;
  next();
}

export const setStatusCreateValidator = (req, res, next) => {
  req.schema = statusSchema;
  next();
}

export const setStatusUpdateValidator = (req, res, next) => {
  req.schema = updateStatusSchema;
  next();
}