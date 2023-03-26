import { OpenAI } from 'langchain';
import { initializeAgentExecutor } from 'langchain/agents';
import { RequestsGetTool, RequestsPostTool } from 'langchain/tools';

import { SkillHubPluginTool } from '~/skillhub-tool.js';

import type { NextApiRequest, NextApiResponse } from 'next';

type RequestData = {
  message: string;
};

type ResponseData = {
  message: string;
};

const chat = new OpenAI({
  openAIApiKey: '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',
  temperature: 0,
});
const tools = [];

async function queryForTools(description: string) {
  const hubResp = await fetch(
    'http://skillshub.okgodoit.com/apis/search?term=' + encodeURIComponent(description),
  );
  if (!hubResp.ok) {
    throw new Error(`Failed to fetch hub with status ${hubResp.status}`);
  }
  const hubRespJson = await hubResp.json();

  //const result = await fetch("https://www.klarna.com/.well-known/ai-plugin.json");

  const resultTools = [];

  for (let index = 0; index < hubRespJson.length; index++) {
    const result = hubRespJson[index];

    //console.log("Got " + JSON.stringify(result) + " tool from SkillsHub");
    const apiSpec = await fetch(result.spec_url);
    if (!apiSpec.ok) {
      throw new Error(
        `Failed to fetch API spec from ${result.spec_url} with status ${apiSpec.status}`,
      );
    }

    let apiSpecJson = await apiSpec.text();
    if (apiSpecJson.length > 3000) apiSpecJson = apiSpecJson.substring(0, 3000);

    const newTool = new SkillHubPluginTool({
      name: result.model_name ?? result.name_for_human ?? result.name_for_model,
      description:
        result.model_description ?? result.description_for_model ?? result.description_for_human,
      apiSpec: `To use this, use the requests_get or requests_post tool, providing the appropriate path and input as specified in this OpenAPI Spec: ${apiSpecJson.substring(
        0,
      )}`,
    });

    //console.log("Returning new TOOL:");
    //console.log(JSON.stringify(newTool));

    resultTools.push(newTool);
  }

  return resultTools;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const data: RequestData = req.body;
  console.log('Received data', data);

  const tools: any[] = [];

  let executor = await initializeAgentExecutor(tools, chat, 'zero-shot-react-description');
  executor.returnIntermediateSteps = true;
  executor.maxIterations = 2;

  const input = data.message;

  let result = await executor.call({ input });

  //console.log();
  console.log('After first call:');

  await Promise.all(
    result.intermediateSteps.map(async (step: any) => {
      if (step.observation.includes('not a valid tool, try another one')) {
        //console.log("Need another tool, checking SkillsHub for: " + step.action.tool + " " + step.action.log.replaceAll("\n", " "));
        const newTools = await queryForTools(
          step.action.tool + ' ' + step.action.log.replaceAll('\n', ' '),
        );
        //console.log("New tools: " + newTools);
        newTools.forEach(tool => {
          ////console.log("NEW TOOL:");
          ////console.log(JSON.stringify(tool));
          tools.push(tool);
        });
      }
    }),
  );

  tools.push(new RequestsGetTool());
  tools.push(new RequestsPostTool());

  console.log('Executing second call');

  executor = await initializeAgentExecutor(
    tools,
    chat,
    'zero-shot-react-description',
    //true
  );
  executor.returnIntermediateSteps = true;
  executor.maxIterations = 5;
  //console.log("Loaded agent.");

  //console.log();
  //console.log("before call, here's all the tools:");
  //console.log(JSON.stringify(executor.tools));

  //console.log();
  //console.log("About to call:");

  result = await executor.call({ input });

  res.status(200).json(result.output);
}
