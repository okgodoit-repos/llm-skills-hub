import { OpenAI } from 'langchain';
import { initializeAgentExecutor } from 'langchain/agents';
import type { NextApiRequest, NextApiResponse } from 'next';

type RequestData = {
  message: string;
};

type ResponseData = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const data: RequestData = req.body;
  console.log('Received data', data);

  const model = new OpenAI({ temperature: 0 });
  const tools: any[] = [];

  const executor = await initializeAgentExecutor(tools, model, 'zero-shot-react-description');

  console.log('Loaded agent.');

  const input = data.message;

  console.log(`Executing with input "${input}"...`);

  const result = await executor.call({ input });

  console.log(`Got output ${result.output}`);

  res.status(200).json(result.output);
}
