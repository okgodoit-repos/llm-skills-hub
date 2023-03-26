###SkillsHub is ChapGPT Plugins for the rest of us. A hub of plugins to call API's and a chat interface using langchain that can automatically determine the appropriate APIs to use, and then use them to fulfill a user's request.

SkillsHub is a public registry (think like npm) where anyone can register their own skill plugins using the exact same format at ChatGPT Plugins.  That means there is zero extra effort to add your ChatGPT plugin to SkillsHub.  As an example, we've directly added the Klarna ChatGPT plugin from their public plugin definition url.  We've also seeded some additional API's using industry standard OpenAPI specs, including the weather.gov API and even a chuck norris joke api.

In addition to the skillhub repository, we have implemented a user-friendly chat interface meant to be as usable as ChatGPT.  It doesn't require you to select the relevant skills, instead it uses vector embeddings to find skills with similar meaning to what you are trying to accomplish and automatically pulls the most relevant plugins into context.  It scales to basically infinite plugins automatically.  You can ask for a chuck norris joke without ever knowing that there even is a chuck norris api.

Why is this exciting if OpenAI is going to release plugin access in a couple weeks?  This works with any large language model!  Currently the demo uses the GPT3 backend, but since it's built on langchain, it could instead use Claude, Llama, the AGI House foundation model, or a finetuned alpaca model.  It could be run locally on your own hardware for anything privacy sensitive.

SkillsHub list view
![SkillsHub list view](https://okgodoit.com/skillshub/1.png)

SkillsHub add plugin
![SkillsHub add plugin](https://okgodoit.com/skillshub/2.png)

Chat example
![Chat example](https://okgodoit.com/skillshub/6.png)

The suggested show
![The suggested show](https://okgodoit.com/skillshub/7.png)

The vector search endpoint called by langchain
![The vector search endpoint called by langchain](https://okgodoit.com/skillshub/8.png)

The team
![The team](https://okgodoit.com/skillshub/10.png)

Status and what's next?
The SkillsHub repo need user accounts so anyone can submit.  The langchain implementation needs to be made more robust, and the chat webpage needs better feedback so you can understand what it's actually doing.  We need to make it work with different LLm backends Basically polish.

Reach out to discuss further!
@okgodoit or roger@okgodoit.com
@dzhng
@martinamps
