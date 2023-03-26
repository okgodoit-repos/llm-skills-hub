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

const chat = new OpenAI({ openAIApiKey: "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", temperature: 0 });
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

	var resultTools = [];

	for (let index = 0; index < hubRespJson.length; index++) {
		const result = hubRespJson[index];

		//console.log("Got " + JSON.stringify(result) + " tool from SkillsHub");
		const apiSpec = await fetch(result.spec_url);
		if (!apiSpec.ok) {
			throw new Error(
				`Failed to fetch API spec from ${apiurl} with status ${apiSpec.status}`
			);
		}
		var apiSpecJson = await apiSpec.text();
		if (apiSpecJson.length > 3000)
			apiSpecJson = apiSpecJson.substring(0, 3000);

		const newTool = new SkillHubPluginTool({
			name: result.model_name ?? result.name_for_human ?? result.name_for_model,
			description: result.model_description ?? result.description_for_model ?? result.description_for_human,
			apiSpec: `To use this, use the requests_get or requests_post tool, providing the appropriate path and input as specified in this OpenAPI Spec: ${apiSpecJson.substring(0,)}`
		});

		//console.log("Returning new TOOL:");
		//console.log(JSON.stringify(newTool));

		resultTools.push(newTool);
	}

	return resultTools;
}
(async () => {

	var executor = await initializeAgentExecutor(
		tools,
		chat,
		"zero-shot-react-description"
	);
	executor.returnIntermediateSteps = true;
	executor.maxIterations = 2;
	//console.log("Loaded agent.");

	var input =
		"I'm going to Denver next week, buy me some clothes that would be appropriate for the weather";

	var args = process.argv.slice(2);
	if (args[0])
		input = args[0];
	
	//console.log(`Executing with input "${input}"...`);

	var result = await executor.call({ input });

	//console.log();
	//console.log("After first call:");



	await Promise.all(result.intermediateSteps.map(async step => {
		if (step.observation.includes("not a valid tool, try another one")) {
			//console.log("Need another tool, checking SkillsHub for: " + step.action.tool + " " + step.action.log.replaceAll("\n", " "));
			const newTools = await queryForTools(step.action.tool + " " + step.action.log.replaceAll("\n", " "));
			//console.log("New tools: " + newTools);
			newTools.forEach(tool => {
				////console.log("NEW TOOL:");
				////console.log(JSON.stringify(tool));
				tools.push(tool);
			});
		}
	}));



	tools.push(new RequestsGetTool());
	tools.push(new RequestsPostTool());

	executor = await initializeAgentExecutor(
		tools,
		chat,
		"zero-shot-react-description"
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


	console.log(result.output);

	//console.log(JSON.stringify(result));

})();