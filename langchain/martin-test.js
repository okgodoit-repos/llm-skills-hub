import { OpenAI } from "langchain";
import { initializeAgentExecutor } from "langchain/agents";
import { SerpAPI, Calculator } from "langchain/tools";
import { SkillHubPluginTool } from "./skillhub-tool.js";
import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import {
	RequestsGetTool,
	RequestsPostTool,
	AIPluginTool,
  } from "langchain/tools";

const chat = new ChatOpenAI({ openAIApiKey: "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", temperature: 0 });
const tools = [];

async function queryForTools(description) {
	const hubResp = await fetch("http://skillshub.okgodoit.com/apis/search?term=" + encodeURIComponent(description));
	if (!hubResp.ok) {
		throw new Error(
		  `Failed to fetch hub with status ${hubResp.status}`
		);
	  }
	  const hubRespJson = await hubResp.json();
  
	//const result = await fetch("https://www.klarna.com/.well-known/ai-plugin.json");

	return hubRespJson.map(result => {
		console.log("Got " + JSON.stringify(result) + " tool from SkillsHub");
		return new SkillHubPluginTool({
			name: result.model_name ?? result.name_for_human ?? result.name_for_model,
			description: result.model_description ?? result.description_for_model ?? result.description_for_human,
			apiSpec: result.spec_url ?? result.api.url
		});
	});
}
(async () => {

	const executor = await initializeAgentExecutor(
		tools,
		chat,
		"zero-shot-react-description"
	);
	executor.returnIntermediateSteps = true;
	executor.maxIterations = 2;
	console.log("Loaded agent.");

	const input =
		"I'm going to Denver next week, buy me some clothes that would be appropriate for the weather";
	console.log(`Executing with input "${input}"...`);

	var result = await executor.call({ input });

	console.log();
	console.log("After first call:");

	result.intermediateSteps.forEach(async step => {
		if (step.observation.includes("not a valid tool, try another one")) {
			console.log("Need another tool, checking SkillsHub for: " + step.action.tool + " " + step.action.log.replaceAll("\n", " "));
			const newTools = await queryForTools(step.action.tool + " " + step.action.log.replaceAll("\n", " "));
			console.log("NEW TOOL:");
			console.log(JSON.stringify(newTools));
			newTools.forEach(tool => {
				executor.tools.push(tool);
			});
		}
	});

	console.log();
	console.log("About to call:");


	executor.tools.push(new RequestsGetTool());
	executor.tools.push(new RequestsPostTool());

	result = await executor.call({ input });

	console.log(`Got output ${result.output}`);

	console.log(JSON.stringify(result));

})();