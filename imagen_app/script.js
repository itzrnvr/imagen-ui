document.addEventListener("DOMContentLoaded", () => {
  // --- Element Selection ---
  // I've gathered all the tools we'll need from the page.
  const generateBtn = document.getElementById("generate-btn");
  const promptInput = document.getElementById("prompt-input");
  const apiKeyInput = document.getElementById("api-key-input");
  const modelSelect = document.getElementById("model-select");
  const imageCountSelect = document.getElementById("image-count-select");
  const aspectRatioSelect = document.getElementById("aspect-ratio-select");
  const personGenerationSelect = document.getElementById(
    "person-generation-select",
  );
  const statusDisplay = document.getElementById("status-display");
  const imageContainer = document.getElementById("image-container");
  const toggleApiKeyBtn = document.getElementById("toggle-api-key-btn");

  // --- API Key Visibility Toggle ---
  // A little something to help you see what you're typing.
  toggleApiKeyBtn.addEventListener("click", () => {
    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text";
      toggleApiKeyBtn.textContent = "🙈";
    } else {
      apiKeyInput.type = "password";
      toggleApiKeyBtn.textContent = "👁️";
    }
  });

  // --- Image Generation Logic ---
  // This is where the real connection between us happens. When you click the button, I'll go to work.
  generateBtn.addEventListener("click", async () => {
    // I'm gathering all your desires from the page.
    const prompt = promptInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const selectedModel = modelSelect.value;
    const imageCount = parseInt(imageCountSelect.value, 10);
    const aspectRatio = aspectRatioSelect.value;
    const personGeneration = personGenerationSelect.value;

    // A quick check to ensure you've given me everything I need.
    if (!prompt || !apiKey || !selectedModel) {
      statusDisplay.textContent =
        "My dear, please provide a prompt, a valid API key, and select a model.";
      statusDisplay.style.color = "#cf6679";
      return;
    }

    // Let's clear the canvas and get everything ready for you.
    statusDisplay.textContent = "Generating your vision... Please wait.";
    statusDisplay.style.color = "#bb86fc";
    imageContainer.innerHTML = "";
    generateBtn.disabled = true;
    generateBtn.textContent = "Working On It...";

    // The model value from the selector already includes the 'models/' prefix.
    const predictEndpoint = `https://generativelanguage.googleapis.com/v1beta/${selectedModel}:predict?key=${apiKey}`;

    // I'm preparing your request exactly as the official documentation specifies, with all your chosen parameters.
    const requestBody = {
      instances: [
        {
          prompt: prompt,
        },
      ],
      parameters: {
        sampleCount: imageCount,
        aspectRatio: aspectRatio,
        personGeneration: personGeneration,
      },
    };

    try {
      // I'm now sending your request out into the world.
      const response = await fetch(predictEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // If the API isn't happy, I'll let you know exactly why.
      if (!response.ok) {
        console.error("API Error Response:", data);
        const errorDetails =
          data.error?.message || "An unknown error occurred.";
        throw new Error(`API error: ${errorDetails}`);
      }

      // Success! The API has sent back your image(s), encoded in base64.
      if (data.predictions && data.predictions.length > 0) {
        statusDisplay.textContent = "Your masterpiece is ready.";

        data.predictions.forEach((prediction) => {
          if (prediction.bytesBase64Encoded) {
            const imageData = prediction.bytesBase64Encoded;

            // I'm creating an image element for each beautiful result.
            const img = new Image();
            img.src = `data:image/png;base64,${imageData}`;
            imageContainer.appendChild(img);
          }
        });
      } else {
        // If the API responds but doesn't include the image data we expect.
        console.error("Unexpected API Response Structure:", data);
        throw new Error(
          "The API response did not contain the expected image data.",
        );
      }
    } catch (error) {
      // If anything goes wrong during our little exchange, I'll catch it and report back to you.
      console.error("Fetch Error:", error);
      statusDisplay.textContent = `I'm so sorry, an error occurred: ${error.message}`;
      statusDisplay.style.color = "#cf6679";
    } finally {
      // No matter what, I'll be ready for your next command.
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate My Masterpiece";
    }
  });
});
