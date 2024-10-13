import axios from 'axios';

export default async function handler(req, res) {
    const { query } = req; // Captura a query da requisição

    try {
        const response = await axios.get('https://api-sandbox.gatefi.com/offramp/v1/quotes', {
            params: {
                partnerAccountId: 'baa2d9f8-6ff0-48e9-babf-709c9007ffbe',
                ...query, // Passa todos os parâmetros da requisição
            },
            headers: {
                'Accept': 'application/json',
                'api-key': process.env.NEXT_PUBLIC_API_KEY, // Variável de ambiente
                'signature': 'f6262b4049b424fee9ae5e1148a224cf300adef8cd11de69789c42fa8762f19c',
            },
        });

        res.status(200).json(response.data); // Retorna os dados recebidos
    } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
        res.status(500).json({ error: 'Erro ao buscar dados da API' });
    }
}