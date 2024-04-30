import { config as load_dotenv } from "dotenv";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { connect } from "vectordb";

import { loadJSON } from "./utils.js";

load_dotenv();

const vectorStorePath = "lancedb";
const ragConfig = loadJSON("config/rag.json");

const PROMT_TEMPLATE = `Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
`;

/**
 * Ask a Question about the documents in your store.
 */
export async function query(arg) {
  console.log("Querying: " + arg);

  const db = await connect(vectorStorePath);
  const table = await db.openTable("vectors");

  const vectorStore = new LanceDB(new OpenAIEmbeddings(), { table });

  const result = await vectorStore.similaritySearch(arg, ragConfig.numDocs);
  console.log("Result:", result);

  const llm = new ChatOpenAI({
    modelName: ragConfig.model,
    temperature: ragConfig.temperature,
  });
  const customRagPrompt = PromptTemplate.fromTemplate(PROMT_TEMPLATE);
  const ragChain = await createStuffDocumentsChain({
    llm,
    prompt: customRagPrompt,
    outputParser: new StringOutputParser(),
  });

  const answer = await ragChain.invoke({
    question: arg,
    context: result,
  });

  return { answer: answer, context: result, question: arg };
}

// await query(process.argv[2])
