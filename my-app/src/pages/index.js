// pages/index.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// import '../styles/App.css'; // Assumindo que você vai mover seu CSS para a pasta styles

const Home = () => {
  const [amount, setAmount] = useState("");
  const [payment, setPayment] = useState("PIX");
  const [crypto, setCrypto] = useState("ETH");
  const [fiat, setFiat] = useState("BRL");
  const [wallet, setWallet] = useState("0xc458f721D11322E36f781a9C58055de489178BF2");
  const [region, setRegion] = useState("BR");
  const [resultOnramp, setResultOnramp] = useState(null);
  const [resultOfframp, setResultOfframp] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSelling, setIsSelling] = useState(false);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/onramp`, {
        params: {
          partnerAccountId: 'baa2d9f8-6ff0-48e9-babf-709c9007ffbe',
          payment,
          crypto,
          fiat,
          amount,
          region,
          wallet,
          redirectUrl: "www.unlimit.com"
        },
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.NEXT_PUBLIC_API_KEY,
          'signature': 'dd32b38bc3cd9046ce0d09699c770deaf43fe4f9c06eebc649ecc4ba76802930',
        },
      });
      setResultOnramp(response.data);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar os dados");
      setResultOnramp(null);
    } finally {
      setLoading(false);
    }
  }, [amount, payment, crypto, fiat, region, wallet]);

  const fetchOfframpQuote = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/offramp`, {
        params: {
          partnerAccountId: 'baa2d9f8-6ff0-48e9-babf-709c9007ffbe',
          payment,
          fiat,
          crypto,
          region,
          cryptoAmount: amount,
          wallet,
        },
        headers: {
          'Accept': 'application/json',
          'api-key': process.env.NEXT_PUBLIC_API_KEY,
          'signature': 'f6262b4049b424fee9ae5e1148a224cf300adef8cd11de69789c42fa8762f19c',
        },
      });

      setResultOfframp(response.data);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar os dados");
      setResultOfframp(null);
    } finally {
      setLoading(false);
    }
  }, [amount, payment, crypto, fiat, region, wallet]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSelling) {
        fetchOfframpQuote();
      } else {
        fetchQuote();
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [fetchQuote, fetchOfframpQuote, isSelling]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSelling) {
      fetchOfframpQuote(); // Chama a função de Offramp
    } else {
      fetchQuote(); // Chama a função de Onramp
    }
  };

  const amountInOnramp = resultOnramp?.amountIn;
  const amountOutOnramp = resultOnramp?.amountOut;
  const amountInOfframp = resultOfframp?.amountIn;
  const amountOutOfframp = resultOfframp?.amountOut;

  const handleButtonClickOnramp = () => {
    const payout = amountOutOnramp || amountOutOfframp; // Use a saída correta de acordo com a operação
    const fiatCurrency = fiat; // Aqui, você pode usar o valor que deseja

    const urlOnramp = `https://onramp-sandbox.gatefi.com/?merchantId=baa2d9f8-6ff0-48e9-babf-709c9007ffbe&cryptoCurrency=${crypto}&payment=${payment}&payout=${payout}&fiatCurrency=${fiatCurrency}&region=${region}&wallet=${wallet}&walletLock=true&fiatCurrencyLock=true&cryptoCurrencyLock=true&fiatAmount=${amount}&redirectUrl=https://www.unlimit.com`;
    window.open(urlOnramp, '_blank');
  };

  const handleButtonClickOfframp = () => {
    const fiatCurrency = fiat; // A moeda fiat a ser usada
    const cryptoAmount = amount; // Usando o valor da quantidade de criptomoeda que será vendida

    const urlOfframp = `https://offramp-sandbox.gatefi.com/?merchantId=baa2d9f8-6ff0-48e9-babf-709c9007ffbe&cryptoCurrency=${crypto}&payment=${payment}&fiatCurrency=${fiatCurrency}&region=${region}&wallet=${wallet}&walletLock=true&fiatCurrencyLock=true&cryptoCurrencyLock=true&cryptoAmount=${cryptoAmount}&redirectUrl=https://www.unlimit.com`;

    window.open(urlOfframp, '_blank');
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="quote-form">
        <div className="toggle-area">
          <button type="button" onClick={() => setIsSelling(false)} className={`toggle-button ${!isSelling ? 'active' : ''}`}>
            Buy
          </button>
          <button type="button" onClick={() => setIsSelling(true)} className={`toggle-button ${isSelling ? 'active' : ''}`}>
            Sell
          </button>
        </div>
        <label htmlFor="wallet">
          Wallet
          <input className="wallet-form" type="text" value={wallet} onChange={(e) => setWallet(e.target.value)} />
        </label>
        <label htmlFor="region">
          Region:
          <select className="region-form" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="BR">BR</option>
            <option value="MX">MX</option>
          </select>
        </label>
        <label>
          Currency:
          <select className="currency-form" value={fiat} onChange={(e) => setFiat(e.target.value)}>
            <option value="BRL">BRL</option>
            <option value="MXN">MXN</option>
          </select>
        </label>
        <label htmlFor="amount">
          Amount ({isSelling ? crypto : fiat}):
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label>
          Crypto:
          <input className="crypto-form" type="text" value={crypto} onChange={(e) => setCrypto(e.target.value)} />
        </label>
        <label>
          Payment Method:
          <select className="payment-form" value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="PIX">PIX</option>
            <option value="SPEI">SPEI</option>
            <option value="SEPA">SEPA</option>
          </select>
        </label>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Carregando...' : 'Get Quote'}
        </button>
      </form>

      <div>
        {/* Resultados do Onramp */}
        {resultOnramp && !isSelling && (
          <div className="result-container">
            <h2> Buying Results</h2>
            <p>{fiat}: {amountInOnramp}</p>
            <p>{crypto}: {amountOutOnramp}</p>
            <button onClick={handleButtonClickOnramp} className="action-button"> Buy Now</button>  {/* Botão para Onramp */}
          </div>
        )}
        {/* Resultados do Offramp */}
        {resultOfframp && isSelling && (
          <div className="result-container">
            <h2>Selling Results</h2>
            <p>{crypto}: {amountInOfframp}</p>
            <p>{fiat}: {amountOutOfframp}</p>
            <button onClick={handleButtonClickOfframp} className="action-button">Sell Now</button>  {/* Botão para Offramp */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;