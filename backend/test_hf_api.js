async function run() {
  const prompt = `You are a social media expert. Your task is to write content strictly about the User's Topic.
DO NOT use generic marketing boilerplate. Stick directly to the subject matter requested.

Topic: about rescuing cats
Platform: Instagram
Tone: Professional
Content Type: caption

Rules:
- Write exactly what was requested.
- Keep it clean; no markdown choices or internal thoughts.
- Make it highly relevant to "about rescuing cats".

Structure needed:
1. Hook line.
2. Short, engaging body.
3. Call to Action.`;

  const messages = [
    { role: "system", content: "You are an expert copywriter. Output strictly the requested social media content without acknowledging instructions or offering generic business advice." },
    { role: "user", content: prompt }
  ];

  try {
    const response = await fetch("https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-7B-Instruct/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer hf_dummy" // Use dummy or no auth
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct",
        messages,
        max_tokens: 100
      })
    });
    console.log("Status:", response.status);
    console.log(await response.text());
  } catch(e) {
    console.error(e);
  }
}
run();
