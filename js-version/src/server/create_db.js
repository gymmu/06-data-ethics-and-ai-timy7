import { config as load_dotenv } from "dotenv"
import { TextLoader } from "langchain/document_loaders/fs/text"
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { DirectoryLoader } from "langchain/document_loaders/fs/directory"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { OpenAIEmbeddings } from "@langchain/openai"
import { CloseVectorNode } from "langchain/vectorstores/closevector/node"

load_dotenv()

console.log("Create DB")
console.log("Load API Key:", process.env.OPENAI_API_KEY)

const vectorStorePath = "public/vectorstore"
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
    const dirLoader = new DirectoryLoader(DATA_PATH, {
        ".md": (path) => new TextLoader(path),
        ".txt": (path) => new TextLoader(path),
        ".pdf": (path) => new PDFLoader(path)
    })

    const docs = await dirLoader.load()

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
    vectorStore.save(vectorStorePath)
    console.log("Saved chunks to Chroma")
}

await main()
