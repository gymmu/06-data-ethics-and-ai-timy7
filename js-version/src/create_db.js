import {config as load_dotenv} from "dotenv"
import {TextLoader} from "langchain/document_loaders/fs/text"
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter"
import {MemoryVectorStore} from "langchain/vectorstores/memory"
import {OpenAIEmbeddings} from "@langchain/openai"
import {CloseVectorNode} from "langchain/vectorstores/closevector/node"

load_dotenv()

console.log("Create DB")
console.log("Load API Key:", process.env.OPENAI_API_KEY)

const CHROMA_PATH = "chroma"
const DATA_PATH = "public/data/"

async function main() {
    await generate_data_store()
}

async function generate_data_store() {
    const documents = await load_documents()
    const chunks = await split_text(documents)
    console.log(chunks)
    await save_to_chroma(chunks)
}

async function load_documents() {
    const loader = new TextLoader("public/data/alice_in_wonderland.md")
    const docs = await loader.load()
    console.log("Documents loaded")
    return docs
}

async function split_text(docs) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 100
    })
    const chunks = await splitter.splitDocuments(docs)
    console.log("Documents splitted")
    return chunks
}

async function save_to_chroma(chunks) {
    const vectorStore = await CloseVectorNode.fromDocuments(chunks, new OpenAIEmbeddings())
    vectorStore.save(CHROMA_PATH)
    console.log("Saved chunks to Chroma")
}

await main()
