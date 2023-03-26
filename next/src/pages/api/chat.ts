// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type RequestData = {
  messages: string[];
};

type ResponseData = {
  messages: string[];
};

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const data: RequestData = req.body;
  console.log('Received data', data);

  res.status(200).json({ messages: [...data.messages, 'hello'] });
}
