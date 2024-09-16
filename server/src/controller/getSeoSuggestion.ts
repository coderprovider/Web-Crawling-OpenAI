import { Request, Response } from "express";

const getSeoSuggestion = async (req: Request, res: Response) => {
  console.log("seo part");
  console.log("====>", req?.body);
  
};

module.exports = {
  getSeoSuggestion
};
