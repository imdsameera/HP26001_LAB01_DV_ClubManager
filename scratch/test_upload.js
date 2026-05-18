const fs = require('fs');

async function test() {
  const fd = new FormData();
  fd.append("initials", "T. U.");
  fd.append("firstName", "Test");
  fd.append("lastName", "User");
  fd.append("email", "test.user@example.com");
  fd.append("phoneCode", "+94");
  fd.append("phone", "770000000");
  fd.append("whatsappCode", "+94");
  fd.append("whatsapp", "770000000");
  fd.append("address", "Test Address");
  
  // Create a tiny dummy image (1x1 transparent PNG)
  const imgBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
  const blob = new Blob([imgBuffer], { type: "image/png" });
  fd.append("avatar", blob, "test.png");

  console.log("Sending request...");
  try {
    const res = await fetch("http://localhost:3000/api/members/join", {
      method: "POST",
      body: fd
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
}
test();
