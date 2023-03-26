import { Tool } from "langchain/tools";

export class SkillHubPluginTool
	extends Tool
{
	_name;

	_description;

	apiSpec;

	get name() {
		return this._name;
	}

	get description() {
		return this._description;
	}

	constructor(params) {
		super();
		this._name = params.name;
		this._description = params.description;
		this.apiSpec = params.apiSpec;
	}

	async _call(_input) {
		return this.apiSpec;
	}

	static async fromPluginUrl(url) {
		const aiPluginRes = await fetch(url);
		if (!aiPluginRes.ok) {
			throw new Error(
				`Failed to fetch plugin from ${url} with status ${aiPluginRes.status}`
			);
		}
		const aiPluginJson = await aiPluginRes.json();

		const apiUrlRes = await fetch(aiPluginJson.api.url);
		if (!apiUrlRes.ok) {
			throw new Error(
				`Failed to fetch API spec from ${aiPluginJson.api.url} with status ${apiUrlRes.status}`
			);
		}
		const apiUrlJson = await apiUrlRes.text();

		return new SkillHubPluginTool({
			name: aiPluginJson.name_for_model,
			description: `The ${aiPluginJson.name_for_human} API. ${aiPluginJson.description_for_human}`,
			apiSpec: `Usage Guide: ${aiPluginJson.description_for_model}

OpenAPI Spec: ${apiUrlJson}`,
		});
	}

	static async fromPluginDetails(
		name,
		description,
		apiurl
	) {
		const apiUrlJson = await apiurl;

		return new SkillHubPluginTool({
			name: name,
			description: `The ${name} API. ${description}`,
			apiSpec: `Usage Guide: ${description}

OpenAPI Spec: ${apiUrlJson}`,
		});
	}
}
