async function run() {
  const form = new FormData();
  form.append("topic", "about rescuing cats");
  form.append("platform", "Instagram");
  form.append("tone", "Professional");
  form.append("optimize", "true");
  
  try {
    const res = await fetch("http://localhost:5000/api/generate-content", {
      method: "POST",
      body: form
    });
    console.log("Status:", res.status);
    console.log(await res.json());
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
