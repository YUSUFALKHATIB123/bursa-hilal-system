import { Request, Response } from "express";

export function handleDemo(req: Request, res: Response) {
  res.json({ message: "Demo endpoint working!" });
}

