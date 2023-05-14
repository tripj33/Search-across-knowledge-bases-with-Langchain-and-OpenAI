import { CallbackManager, ConsoleCallbackHandler } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";

const aggregatorStreamAgent = async (
  question: string,
  responseList: string[],
  startCallback: () => void,
  streamCallback: (token: string) => void,
  endCallback: () => void
) => {
  const callbackManager = CallbackManager.fromHandlers({
    async handleLLMStart(llm, _prompts: string[]) {
      console.log("handle LLM start", { llm });
      startCallback();
    },
    async handleLLMEnd(output) {
      console.log("handle LLM end", { output });
      // execute end callback
      endCallback();
    },
    async handleLLMNewToken(token) {
      streamCallback(token);
    },
  });
  callbackManager.addHandler(new ConsoleCallbackHandler());
  console.log({
    AGGREGATOR_STREAM_AGENT_MODEL_NAME:
      process.env.AGGREGATOR_STREAM_AGENT_MODEL_NAME,
  });
  const chatModel = new ChatOpenAI({
    modelName:
      process.env.AGGREGATOR_STREAM_AGENT_MODEL_NAME ?? "gpt-3.5-turbo",
    temperature: 0.6,
    maxTokens: 1500,
    streaming: true,
    callbackManager,
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "Return the aggregated information from the extracted text to answer the refined question."
    ),
    HumanMessagePromptTemplate.fromTemplate(
      "Context: {context}\n\n###\n\nQuestion: {question}"
    ),
  ]);

  const chain = new LLMChain({
    prompt: chatPrompt,
    llm: chatModel,
    callbackManager,
  });

  const context = constructContextPrompt(responseList);

  // console.log({ context });

  const response = await chain.call({
    context,
    question,
  });

  console.log({ context, question, response: response.text });
  return response;
};

export default aggregatorStreamAgent;

const constructContextPrompt = (responseList: string[]) => {
  const contextList = responseList.map((response) =>
    response.replace(/\s+/g, " ")
  );

  return contextList
    .map((context, ind) => `- ${ind + 1}. ${context}\nhello\n`)
    .join("\nhello\n");
};

