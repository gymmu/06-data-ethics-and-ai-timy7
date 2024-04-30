import { config as load_dotenv } from "dotenv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { CloseVectorNode } from "@langchain/community/vectorstores/closevector/node";

import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { connect } from "vectordb";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import os from "node:os";

import puppeteer from "puppeteer";

import { loadJSON } from "./utils.js";
load_dotenv();

const vectorStorePath = "closevector";
const DATA_PATH = "data/";
const ragConfig = loadJSON("config/rag.json");

async function main() {
  await generate_data_store();
}

async function generate_data_store() {
  const chunks = await load_documents();
  //const chunks = await split_text(documents);
  await save_to_chroma(chunks);
}

async function load_documents() {
  const dirLoader = new DirectoryLoader(DATA_PATH, {
    ".md": (path) => new TextLoader(path),
    ".txt": (path) => new TextLoader(path),
    ".pdf": (path) => new PDFLoader(path),
  });

  const docs = await dirLoader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: ragConfig.chunkSize,
    chunkOverlap: ragConfig.chunkOverlap,
  });
  const chunks = await splitter.splitDocuments(docs);

  // const links = await getWebsiteLinks("https://gymmu.github.io/gym-inf/")
  const links = loadJSON("config/websites.json");
  const websites = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    console.log("Loading website: ", link);

    const webLoader = new PuppeteerWebBaseLoader(link, {
      launchOptions: {
        headless: "new",
      },
    });
    const website = await webLoader.load();
    websites.push(website);
  }

  const flatWebsites = websites.flat();

  const webSplitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
    chunkSize: ragConfig.chunkSize,
    chunkOverlap: ragConfig.chunkOverlap,
  });
  const webChunks = await webSplitter.splitDocuments(flatWebsites);

  return [chunks, webChunks].flat();
}

async function getWebsiteLinks(baseUrl) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  console.log("Opening page: ", baseUrl);
  await page.goto(baseUrl);

  await page.waitForSelector("a");

  const content = await page.content();
  console.log(content);

  const links = await page.$$eval("a", (as) => {
    const l = as.map((a) => a.href);
    return l;
  });
  console.log("Gathered the following links:", links);
  browser.close();
  return links;
}

async function split_text(docs) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: ragConfig.chunkSize,
    chunkOverlap: ragConfig.chunkOverlap,
  });
  const chunks = await splitter.splitDocuments(docs);
  console.log("Documents splitted");
  return chunks;
}

async function save_to_chroma(chunks) {
  const docs = chunks.map((c) => {
    return {
      pageContent: c.pageContent,
      metadata: { source: c.metadata.source },
    };
  });
  const db = await connect("./lancedb");
  const embeddings = new OpenAIEmbeddings();
  try {
    await db.dropTable("vectors");
  } catch (e) {
    console.log("Es gibt keine Tabelle 'vectors'...");
  }
  const table = await db.createTable("vectors", [
    {
      vector: await embeddings.embedQuery("Hello world"),
      text: "sample",
      source: "a",
    },
  ]);

  const vectorStore = await LanceDB.fromDocuments(docs, embeddings, {
    table,
  });

  console.log("Saved chunks to Chroma");
}

await main();
