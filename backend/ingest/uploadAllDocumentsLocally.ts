// in this version, we will "uploading" to the local file system. Within `/data/vectorstore-files` with each index being their own "namespace"

import type { NewDocumentTypeChunked } from "../types/ingest.js";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { HNSWLib } from "langchain/vectorstores";

const uploadAllDocumentsLocally = async (
  nestedDoc: NewDocumentTypeChunked[][]
) => {
  try {
    for (const docArry of nestedDoc) {
      const currentNamespace = docArry[0].metadata.namespace;

      const documents = docArry.map((doc) => new Document(doc));
      console.log(
        `Embedding and storing vectors ${currentNamespace} to local file system 🤞`
      );
      const vectorStore = await HNSWLib.fromDocuments(
        documents,
        new OpenAIEmbeddings({
          openAIApiKey: "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", // In Node.js defaults to process.env.OPENAI_API_KEY
        })
      );
      console.log("test2")
      // works even if the current folder does not exists :)
      const directory = `./data/vectorestore-files/${currentNamespace}`;
      // overwrites old store, so idempotent YAY!
      await vectorStore.save(directory);
      console.log(`${currentNamespace} has been uploaded to local! 🥳`);
    }
  } catch (error: unknown) {
    throw new Error(error as string);
  }
};

export { uploadAllDocumentsLocally };
