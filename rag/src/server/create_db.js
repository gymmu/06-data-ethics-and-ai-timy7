import { config as load_dotenv } from "dotenv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { connect } from "vectordb";

import { loadJSON } from "./utils.js";
load_dotenv();

const vectorStorePath = "lancedb";
const DATA_PATH = "data/";
const ragConfig = loadJSON("config/rag.json");

async function main() {
  await generate_data_store();
}

async function generate_data_store() {
  const chunks = await load_documents();
  await saveToDB(chunks);
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

async function saveToDB(chunks) {
  const docs = chunks.map((c) => {
    return {
      pageContent: c.pageContent,
      metadata: { source: c.metadata.source },
    };
  });
  const db = await connect(vectorStorePath);
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

  await LanceDB.fromDocuments(docs, embeddings, { table });

  console.log("Saved chunks to in LanceDB");
}

await main();
