import { Mistral } from '@mistralai/mistralai';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { messages } = req.body;

        // Check if messages are provided
        if (!messages) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        const apiKey = process.env.MISTRAL_API_KEY; // Securely access your API key

        if (!apiKey) {
            return res.status(500).json({ error: 'API Key not configured' });
        }

        try {
            const client = new Mistral({ apiKey: apiKey });

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
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}

