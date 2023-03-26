import { OpenAI } from "langchain";
import { initializeAgentExecutor } from "langchain/agents";
import { SerpAPI, Calculator } from "langchain/tools";
import { SkillHubPluginTool } from "./skillhub-tool.js";
import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";


const chat = new ChatOpenAI({ openAIApiKey: "**", temperature: 0 });
const tools = [];

async function queryForTools(description) {
	const hubResp = await fetch("http://skillshub.okgodoit.com/query?desc=" + encodeURIComponent(description)).results;
	//const result = await fetch("https://www.klarna.com/.well-known/ai-plugin.json");

	return hubResp.results.map(result => {
		console.log("Got " + (result) + " tool from SkillsHub");
		return new SkillHubPluginTool({
			name: result.name ?? result.name_for_human ?? result.name_for_model,
			description: result.description ?? result.description_for_model ?? result.description_for_human,
			apiSpec: result.url ?? result.api.url
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

	result.intermediateSteps.forEach(async step => {
		if (step.observation.includes("not a valid tool, try another one")) {
			console.log("Need another tool, checking SkillsHub for: " + step.action.tool + " " + step.action.log.replaceAll("\n", " "));
			executor.tools = executor.tools.concat(await queryForTools(step.action.tool + " " + step.action.log.replaceAll("\n", " ")));
		}
	});

	result = await executor.call({ input });

	console.log(`Got output ${result.output}`);

})();