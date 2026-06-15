let provider;
let signer;

const contractAddress =
"0x2DA9c36090359765Ab92AF5621Be8D8BD9ce42A2";

const abi = [
  {
    "inputs":[
      {
        "internalType":"string",
        "name":"_token",
        "type":"string"
      },
      {
        "internalType":"uint256",
        "name":"_score",
        "type":"uint256"
      }
    ],
    "name":"saveAnalysis",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  }
];

document
.getElementById("connectBtn")
.addEventListener("click", connectWallet);

async function connectWallet(){

  if(!window.ethereum){
    alert("Install MetaMask");
    return;
  }

  try{

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x138b" }]
    });

  }catch(err){

    console.log(err);

    alert(
      "Please manually switch to Mantle Sepolia in MetaMask."
    );

    return;
  }

  provider =
  new ethers.BrowserProvider(
    window.ethereum
  );

  await provider.send(
    "eth_requestAccounts",
    []
  );

  signer =
  await provider.getSigner();

  const network =
  await provider.getNetwork();

  alert(
    "Connected to chain: " +
    network.chainId
  );

  document
    .getElementById("connectBtn")
    .innerText =
    "Wallet Connected";
}

async function analyzeToken() {

  const token =
  document.getElementById("token").value;

  if (!token) {
    alert("Enter a token");
    return;
  }

  document.getElementById("result").innerHTML =
  "<p>Analyzing...</p>";

  try {

    const response = await fetch("/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
    throw new Error(
        data.error || "Server error"
    );
    }

    if (!data.result) {
    throw new Error(
        "No analysis returned"
    );
    }

    let cleaned = data.result
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");

    cleaned =
      cleaned.substring(
        firstBrace,
        lastBrace + 1
      );

    const result =
      JSON.parse(cleaned);

    window.currentToken =
      result.token;

    window.currentScore =
      result.alphaScore;

    document.getElementById("result").innerHTML = `

      <h2>${result.token}</h2>

      <p>
        <strong>Alpha Score:</strong>
        ${result.alphaScore}/100
      </p>

      <p>
        <strong>Risk:</strong>
        ${result.risk}
      </p>

      <h3>Bullish Factors</h3>

      <ul>
        ${result.bullishFactors
          .map(item => `<li>${item}</li>`)
          .join("")}
      </ul>

      <h3>Bearish Factors</h3>

      <ul>
        ${result.bearishFactors
          .map(item => `<li>${item}</li>`)
          .join("")}
      </ul>

      <p>
        <strong>Recommendation:</strong>
        ${result.recommendation}
      </p>

      <button onclick="saveToMantle()">
        Save Analysis On Mantle
      </button>
    `;

  } catch (error) {

    console.error(error);

    document.getElementById("result").innerHTML =
    `<p>Error: ${error.message}</p>`;
  }
}

async function saveToMantle(){

  if(!signer){
    alert("Connect wallet first");
    return;
  }

  try{

    const contract =
    new ethers.Contract(
      contractAddress,
      abi,
      signer
    );

    const tx =
    await contract.saveAnalysis(
      window.currentToken,
      Number(window.currentScore)
    );

    await tx.wait();

    alert(
        `Saved!\nTransaction: ${tx.hash}`
    );

  }catch(err){

    console.error(err);

    alert(
      "Transaction Failed"
    );
  }
}