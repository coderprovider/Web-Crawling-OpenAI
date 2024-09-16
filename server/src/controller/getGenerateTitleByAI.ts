import OpenAI from "openai";
import * as dotenv from "dotenv";
import axios from "axios";
import { Request, Response } from "express";
import { JSDOM } from "jsdom";

dotenv.config();

const API_KEY = "1DXaFnDZnTdl9Sllk7oKAw";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface CompanyData {
  niche: string;
  location: string;
  targetSiteUrl: string;
}

interface SEOData {
  metaTags: string[];
  title: string;
  headers: (string | null)[];
  paragraphs: (string | null)[];
}

const extractSEOData = async (htmlContent: string): Promise<SEOData> => {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  const metaTags = Array.from(document.querySelectorAll("meta")).map(
    (meta: HTMLMetaElement) => meta.outerHTML
  );
  const title = document.querySelector("title")?.textContent || "";
  const headers = Array.from(document.querySelectorAll("h1, h2")).map(
    (header) => header.textContent?.trim() || null
  );
  const paragraphs = Array.from(document.querySelectorAll("p"))
    .slice(0, 3)
    .map((p) => p.textContent?.trim() || null);

  return {
    metaTags,
    title,
    headers,
    paragraphs
  };
};

const crawlWebsite = async (url: string) => {
  try {
    const response = await axios.get(
      `https://api.crawlbase.com/?token=${API_KEY}&url=${encodeURIComponent(
        url
      )}`
    );
    const resData = await response?.data;
    if (resData) {
      return resData;
    } else {
      console.log("web crawl error");
    }
  } catch (error) {
    console.error("Error crawling the website:", error);
  }
};

const getSeoContentAI = async (content: string) => {
  const keyWord = await extractSEOData(content);

  try {
    console.log("seo suggestion transfer --------------->");

    const prompt = `
    I have the following content for SEO optimization:
    
    Meta Tags: ${keyWord.metaTags.join("\n")}
    
    Title: ${keyWord.title}
    
    Headers: ${keyWord.headers.filter((h) => h).join("\n")}
    
    Main Content (First 3 paragraphs): ${keyWord.paragraphs
      .filter((p) => p)
      .join("\n")}
    
    Please suggest SEO improvements based on this contents according to 
    each item such as Meta tags, Headers and Main content.
    `;

    const resSEO = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 100,
      temperature: 0.7
    });

    return resSEO.choices[0].message;
  } catch (err) {
    console.log("This is the error", err);
  }
};

const getGenerateTitleByAI = async (
  req: Request<{}, {}, CompanyData>,
  res: Response
) => {
  const { niche, location, targetSiteUrl } = req.body;

  try {

    console.log("______start______");
    
    const prompt = `I am a ${niche} in ${location} and I am looking for keyword suggestions for my pages, please provide me the most relevant suggestion as one keyword: ${targetSiteUrl[0]}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an SEO expert." },
        { role: "user", content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    const crawlData = await crawlWebsite(targetSiteUrl[0]);

    const seoContent = await getSeoContentAI(crawlData);

    console.log("-------------seoContent-------------", seoContent);

    const aiData = response.choices[0].message.content;

    res.send({ aiData, targetSiteUrl, crawlData, seoContent });

  } catch (error) {
    console.error("Error fetching SEO suggestions:", error);
  }
};

module.exports = {
  getGenerateTitleByAI
};
