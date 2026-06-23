const intakeServices = [
  "Commercial Cleaning",
  "Janitorial",
  "Facility Support",
  "Administrative Support",
  "Data Entry",
  "Documentation Support",
  "Home Health Support",
  "Disability Support",
  "ABA Support",
  "General Labor",
  "Transportation",
  "Office Support",
];

const form = document.getElementById("workerIntakeForm");
const message = document.getElementById("intakeMessage");
const serviceSelect = document.getElementById("serviceCategory");

serviceSelect.innerHTML = intakeServices.map((service) => `<option>${service}</option>`).join("");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("Submitting worker intake...", "info");

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.state = (payload.state || "").toUpperCase();

  const endpoint = window.IGEO_WORKER_INTAKE?.endpointUrl;
  if (!endpoint) {
    setMessage("Google Sheets intake endpoint is not connected yet. Add the deployed Apps Script Web App URL in worker-intake-config.js.", "error");
    return;
  }

  try {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    await wait(1500);
    const rows = await readWorkerRows(endpoint);
    const submitted = rows.some((row) => {
      return (
        String(row.Email || "").toLowerCase() === String(payload.email || "").toLowerCase() &&
        String(row["First Name"] || "").toLowerCase() === String(payload.firstName || "").toLowerCase() &&
        String(row["Last Name"] || "").toLowerCase() === String(payload.lastName || "").toLowerCase()
      );
    });

    if (!submitted) {
      setMessage("Submission was sent, but Google Sheets did not confirm the new row. Check the Apps Script deployment URL and permissions.", "error");
      return;
    }

    form.reset();
    serviceSelect.value = intakeServices[0];
    setMessage("Worker intake submitted. The Workforce database will update from Google Sheets.", "success");
  } catch {
    setMessage("Submission failed. Please try again or contact iGeo Solutions LLC.", "error");
  }
});

function setMessage(text, type) {
  message.textContent = text;
  message.dataset.type = type;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readWorkerRows(endpoint) {
  return new Promise((resolve, reject) => {
    const callbackName = `igeoIntakeVerify${Date.now()}`;
    const script = document.createElement("script");
    const separator = endpoint.includes("?") ? "&" : "?";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Verification timed out"));
    }, 8000);

    window[callbackName] = (response) => {
      cleanup();
      if (response?.ok && Array.isArray(response.rows)) {
        resolve(response.rows);
      } else {
        reject(new Error("Invalid verification response"));
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Verification request failed"));
    };

    function cleanup() {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }

    script.src = `${endpoint}${separator}callback=${callbackName}`;
    document.body.appendChild(script);
  });
}
