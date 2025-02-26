import { CallbackManager, ConsoleCallbackHandler } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";

import knowledgebaseJSON from "../knowledgebase-constants.json" assert { type: "json" };

/*
  This agent is expected to select relevant knowledge bases to search from. Returning a list of knowledge bases relevant to the incoming question.
*/

const selectorAgent = async (question: string) => {
  // construct the "context" based on the knowledegbaseJSON
  const callbackManager = CallbackManager.fromHandlers({});
  callbackManager.addHandler(new ConsoleCallbackHandler());
  const systemPrompt = constructSystemPrompt();
  const chatModel = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    // modelName: "gpt-4",
    temperature: 0,
    callbackManager,
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(systemPrompt),
    HumanMessagePromptTemplate.fromTemplate("Question: {question}"),
  ]);

  const chain = new LLMChain({
    prompt: chatPrompt,
    llm: chatModel,
    callbackManager,
  });

  const response = await chain.call({
    question,
  });

  const responseObj = getNamespaceNamePairs(response.text);
  // TODO: error handling for uncertain incorrect responses
  // console.log({ response: response.text });
  // console.log({ responseObj });
  return responseObj;
};

const getNamespaceNamePairs = (
  response: string
): { name: string; namespace: string }[] => {
  const namespaces = knowledgebaseJSON.map((obj) => obj.namespace);
  const foundNamespaces = namespaces.filter((namespace) =>
    response.includes(namespace)
  );
  return foundNamespaces.map((namespace) => {
    const name =
      knowledgebaseJSON.find((obj) => obj.namespace === namespace)?.name || "";
    return { name, namespace };
  });
};

export default selectorAgent;

const constructSystemPrompt = (): string => {
  const namespaceDescriptionMap = knowledgebaseJSON
    .filter((obj) => {
      return obj.namespace !== "test-data";
    })
    .map((obj) => {
      return {
        namespace: obj.namespace,
        description: obj.description,
      };
    });

  const systemPrompt = `Select the relevant knowledge bases to search for an answer to the refined question. Please provide a ranked list of the top 3 most relevant knowledge bases.
Here are the relevant knowledge bases:

Knowledge Bases:
${namespaceDescriptionMap
  .map((obj) => {
    return `- Namespace: "${obj.namespace}"\n  Description: "${obj.description}"`;
  })
  .join("\n")}

Your response should give me a list of the relvant namespaces ONLY.
`;
  return systemPrompt;
};
