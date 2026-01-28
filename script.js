/* ============================
   NAVBAR INJECTION + BEHAVIOR
   ============================ */

const navbarTarget = document.getElementById("navbar");

if (navbarTarget) {
  // ✅ Derive the correct base path from where THIS script is actually loaded
  // Examples:
  //   Live Server:   http://127.0.0.1:5500/script.js            -> basePath "/"
  //   GitHub Pages:  https://user.github.io/atenacrypto.com/script.js -> basePath "/atenacrypto.com/"
  const currentScriptSrc = document.currentScript?.src || "";
  const scriptUrl = currentScriptSrc ? new URL(currentScriptSrc) : null;
  const basePath = scriptUrl
    ? scriptUrl.pathname.replace(/script\.js$/, "") // keeps trailing slash
    : "/";

  const navbarUrl = `${basePath}components/navbar.html`;

  fetch(navbarUrl)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load navbar (${res.status}) at ${navbarUrl}`);
      return res.text();
    })
    .then(html => {
      navbarTarget.innerHTML = html;

      // ✅ Rewrite href/src inside the injected navbar so paths work everywhere
      // Converts:
      //   /index.html -> /atenacrypto.com/index.html (on GH pages)
      //   atenacrypto_logo.png -> /atenacrypto.com/atenacrypto_logo.png (on GH pages)
      const prefix = (url) => {
        if (!url) return url;

        // ignore anchors, mailto, tel, external links
        if (
          url.startsWith("#") ||
          url.startsWith("mailto:") ||
          url.startsWith("tel:") ||
          url.startsWith("http://") ||
          url.startsWith("https://")
        ) return url;

        // already prefixed
        if (url.startsWith(basePath)) return url;

        // root-relative path like "/index.html"
        if (url.startsWith("/")) {
          return basePath.replace(/\/$/, "") + url;
        }

        // relative path like "what-is-cryptocurrency/..."
        return basePath + url.replace(/^\.\//, "");
      };

      navbarTarget.querySelectorAll("a[href]").forEach(a => {
        a.setAttribute("href", prefix(a.getAttribute("href")));
      });

      navbarTarget.querySelectorAll("img[src]").forEach(img => {
        img.setAttribute("src", prefix(img.getAttribute("src")));
      });

      /* --------------------------------------
         Hover intent (AFTER navbar exists)
         -------------------------------------- */
      document.querySelectorAll(".nav-item").forEach(item => {
        let closeTimeout;

        item.addEventListener("mouseenter", () => {
          clearTimeout(closeTimeout);
          item.classList.add("open");
        });

        item.addEventListener("mouseleave", () => {
          closeTimeout = setTimeout(() => {
            item.classList.remove("open");
          }, 200);
        });
      });
    })
    .catch(err => console.error("Navbar load error:", err));
}

/* ============================
   CHAT LOGIC (ONLY IF PRESENT)
   ============================ */

const chatContainer = document.getElementById("chat-container");

if (chatContainer) {
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const suggestionsEl = document.getElementById("suggestions");

  let started = false;

  const suggestions = [
    "What is Bitcoin?",
    "How does crypto trading work?",
    "What is DeFi?",
    "Is crypto risky?"
  ];

  suggestions.forEach(text => {
    const chip = document.createElement("div");
    chip.className = "suggestion";
    chip.textContent = text;
    chip.onclick = () => {
      userInput.value = text;
      sendBtn.click();
    };
    suggestionsEl.appendChild(chip);
  });

  const placeholders = [
    "Ask anything about crypto…",
    "How does Bitcoin work?",
    "Explain DeFi simply",
    "What moves crypto markets?"
  ];

  let p = 0;
  setInterval(() => {
    if (!started) {
      userInput.placeholder = placeholders[p++ % placeholders.length];
    }
  }, 2600);

  function expandChat() {
    if (started) return;
    started = true;
    chatContainer.classList.add("expanded");
    suggestionsEl.remove();
  }

  function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "message ai";
    typing.innerHTML = `
      <div class="typing">
        <span></span><span></span><span></span>
      </div>
    `;
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typing;
  }

  sendBtn.onclick = () => {
    const text = userInput.value.trim();
    if (!text) return;

    expandChat();
    addMessage(text, "user");
    userInput.value = "";

    const typing = showTyping();

    setTimeout(() => {
      typing.remove();
      addMessage(
        "Atena is now active. Soon this will be powered by real-time crypto intelligence.",
        "ai"
      );
    }, 1200);
  };

  userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendBtn.click();
  });
}