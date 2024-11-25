import { Mistral } from '@mistralai/mistralai';

interface MistralModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  capabilities: Record<string, unknown>;
  name: string;
  description: string;
  max_context_length: number;
  aliases: string[];
  deprecation?: string;
  default_model_temperature: number;
  type: string;
}

interface MistralResponse {
  object: string;
  data: MistralModel[];
}

type Model = {
  id: string;
  name: string;
};


import { NextApiRequest, NextApiResponse } from 'next';

interface ChatResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured' });
    }

    const client = new Mistral({ apiKey: apiKey });

    if (req.method === 'GET') {
        try {
            const modelsResponse = await client.models.list() as MistralResponse;
            if (!modelsResponse?.data) {
                throw new Error('Invalid response from Mistral API');
            }
            const modelsSimplified: Model[] = modelsResponse.data.map(model => ({
                id: model.id,
                name: model.name
            }));
            res.status(200).json({ models: modelsSimplified });
        } catch (error) {
            console.error('Error fetching Mistral models:', error);
            res.status(500).json({ error: 'Failed to fetch models from Mistral API' });
        }
    } else if (req.method === 'POST') {
        const { messages } = req.body;

        if (!messages) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        try {
            const chatResponse = await client.chat.complete({
                model: 'mistral-large-latest',
                messages,
            });

            const response = chatResponse as ChatResponse;
            if (!response.choices?.[0]?.message?.content) {
                throw new Error('Invalid response format from Mistral API');
            }
            res.status(200).json({ reply: response.choices[0].message.content });
        } catch (error) {
            console.error('Error with Mistral API:', error);
            res.status(500).json({ error: 'Failed to fetch response from Mistral API' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}

