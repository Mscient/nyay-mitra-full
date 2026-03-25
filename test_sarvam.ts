import OpenAI from "openai";

async function testSarvam() {
  const apiKey = process.env.SARVAM_API_KEY || "sk_bfwqpjwc_cnBj8byuRdgULP1GDihmMWa3";
  console.log("Using API Key:", apiKey ? "Loaded length: " + apiKey.length : "Not found");

  const sarvam = new OpenAI({ 
    apiKey, 
    baseURL: "https://api.sarvam.ai/v1" 
  });

  try {
    console.log("Making request to Sarvam...");
    const completion = await sarvam.chat.completions.create({
      model: "sarvam-2b-v0.5", // Trying different models if sarvam-30b fails
      messages: [{ role: "user", content: "What is 2+2?" }],
    });
    console.log("Success:", JSON.stringify(completion.choices[0].message));
  } catch (e: any) {
    console.error("Error with sarvam-2b-v0.5:", e.message);
    try {
      const completion2 = await sarvam.chat.completions.create({
        model: "sarvam-30b",
        messages: [{ role: "user", content: "What is 2+2?" }],
      });
      console.log("Success with sarvam-30b:", JSON.stringify(completion2.choices[0].message));
    } catch (e2: any) {
      console.error("Error with sarvam-30b:", e2.message);
    }
  }
}

testSarvam();
