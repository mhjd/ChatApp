import { Mistral } from '@mistralai/mistralai';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req, res) {
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured' });
    }

    const client = new Mistral({ apiKey: apiKey });

    if (req.method === 'GET') {
        try {
            const modelsResponse = await client.models.list();
            res.status(200).json({ models: modelsResponse.data });
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

            res.status(200).json({ reply: chatResponse.choices[0].message.content });
        } catch (error) {
            console.error('Error with Mistral API:', error);
            res.status(500).json({ error: 'Failed to fetch response from Mistral API' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}

