let chatInput = document.querySelector('.chat-input');
let sendBtn = document.querySelector('.send-btn');
let chatContainer = document.querySelector('.chat-container');
let chatWrapper  = document.querySelector('.chat-wrapper');
let themeBtn = document.querySelector('.theme-btn');


// Function for scroll
let scrollBottom = () => {
    chatWrapper.scrollTo({
        top: chatWrapper.scrollHeight,
        behavior: "smooth",
    });
};


// Function to create a new chat element
let createElement = (html,...className) => {
    let chatDiv = document.createElement('div');
    chatDiv.classList.add("chat", ...className);
    chatDiv.innerHTML = html;
    return chatDiv;
};

// Function to fetch response from the API
let getResponse = async (userMessage) => {
    let apiKey = "AIzaSyBMf-EmHsJfWGZ84h4PLC-MImAucfHVuvs";
    let apiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5:generateMessage?key=${apiKey}`;

    let requestOption = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{text: userMessage}]
          }]
        }),
    };

    try {
        let response = await fetch(apiUrl, requestOption);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();
        return data.candidates[0]?.content || "Sorry, I couldn't fetch a response.";
    } catch (error) {
        console.error("Error:", error);
        return "Error fetching response from the server.";
    }
};

// Function to handle incoming chat
let incomingChat = async (userMessage) => {
    let botResponse = await getResponse(userMessage);

    // Remove the loader once the response is fetched
    let loaderDiv = document.querySelector('.loader-container');
    if (loaderDiv) {
        loaderDiv.remove();
    }

    // Create the bot's response message
    let html = `<div class="chat-content">
                <div class="chat-detail">
                    <p></p>
                </div>
                <div class="copy-icon">
                    <i onclick="copyText(this)" class="bi bi-copy"></i>
                </div>
            </div>`;

    let chatIncomingDiv = createElement(html, "incoming");
    chatContainer.appendChild(chatIncomingDiv);
    chatIncomingDiv.querySelector('p').textContent = botResponse;

    scrollBottom();
};


// Function to handle outgoing chat
let outgoingChat = () => {
    let userMessage = chatInput.value.trim();
    if (userMessage === "") return;

    // Disable the send button
    sendBtn.setAttribute("disabled", "true");

    // Append the outgoing chat
    let html = `<div class="chat-content">
                <div class="edit-icon">
                    <i onclick="editMessage(this)" class="bi bi-pen"></i>
                </div>
                <div class="chat-detail">
                    <p></p>
                </div>
            </div>`;

    let chatOutgoingDiv = createElement(html, "outgoing", "slide-top");
    chatContainer.appendChild(chatOutgoingDiv);
    chatOutgoingDiv.querySelector('p').textContent = userMessage;

    chatInput.value = "";
    chatInput.style.height = "50px";

    // add loader
    let loaderHtml = `<div class="chat-content">
                        <div class="chat-detail">
                            <div class="loader"></div>
                        </div>
                    </div>`;

    let loaderDiv = createElement(loaderHtml, "incoming", "loader-container");
    chatContainer.appendChild(loaderDiv);
    scrollBottom();

    // Fetch the bot's response after a delay
    setTimeout(() => {
        incomingChat(userMessage).then(() => {
            sendBtn.removeAttribute("disabled");
        });
    }, 500);  

    scrollBottom();
};



// Add event listener to send button
sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    outgoingChat(); 
});

chatInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        outgoingChat();
    }
});




sendBtn.addEventListener('mousedown', (e) => { 
    e.preventDefault();
}); 


//set textarea height and width
chatInput.addEventListener('input', function() { 
    if (this.value.trim() === '') {
        this.style.height = '50px';
    } else {
        this.style.height = '50px'; 
        this.style.height = this.scrollHeight + 'px'; 
    } 
});

let root = document.documentElement;

// Get the value of the CSS variable
let contentWidth = getComputedStyle(root).getPropertyValue('--typing-content-width');
let focusContentWidth  =getComputedStyle(root).getPropertyValue('--focus-typing-content-width')

chatInput.addEventListener('focus', function () {
    this.closest('.typing-content').style.maxWidth = focusContentWidth;
});

chatInput.addEventListener('blur', function () {
    if (this.value.trim() === '') {
        this.closest('.typing-content').style.maxWidth = contentWidth;
    }
});

window.addEventListener('load', function() { 
    if (chatInput.value.trim() === '') {
        chatInput.style.height = '50px';
    } else {
        chatInput.style.height = chatInput.scrollHeight + 'px';
    }

    scrollBottom();
});

// Theme change

const body = document.querySelector('body');

// Check for the current theme in localStorage or default to light mode
let currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    themeBtn.querySelector('i').classList.remove('bi-brightness-high');
    themeBtn.querySelector('i').classList.add('bi-moon'); // Start with moon icon
} else {
    body.classList.add('light-mode');
    themeBtn.querySelector('i').classList.remove('bi-moon');
    themeBtn.querySelector('i').classList.add('bi-brightness-high'); // Start with sun icon
}

themeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    body.classList.toggle('light-mode');
    body.classList.toggle('dark-mode');

    let icon = themeBtn.querySelector('i');

    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('bi-brightness-high');
        icon.classList.add('bi-moon');
        localStorage.setItem('theme', 'dark'); 
    } else {
        icon.classList.remove('bi-moon');
        icon.classList.add('bi-brightness-high');
        localStorage.setItem('theme', 'light'); 
    }
});


themeBtn.addEventListener('mousedown',(e)=>{
    e.preventDefault();
});

// Function for copy icon
let copyText = (btn) => {
    // Find the paragraph text to copy
    let copyResponse = btn.closest('.chat-content').querySelector('p');
    if (copyResponse) {
        navigator.clipboard.writeText(copyResponse.textContent).then(() => {

            let icon = btn.closest('.copy-icon').querySelector('i');
            if (icon) {
                icon.classList.remove('bi-copy');
                icon.classList.add('bi-check2-all');

                
                setTimeout(() => {
                    icon.classList.remove('bi-check2-all');
                    icon.classList.add('bi-copy');
                }, 1000);
            }
        })
    }
};

// Function to handle editing chat messages
let editMessage = (btn) => {
    let chatContent = btn.closest('.chat-content');
    let chatElement = btn.closest('.chat'); 
    let chatDetail = chatContent.querySelector('.chat-detail');
    let paragraph = chatDetail.querySelector('p');
    let currentText = paragraph.textContent;

    // Replace the paragraph with a textarea for editing
    let textarea = document.createElement('textarea');
    textarea.value = currentText;
    textarea.classList.add('edit-area');
    chatDetail.replaceChild(textarea, paragraph);

    textarea.focus();

    // Save changes when the textarea loses focus
    textarea.addEventListener('blur', () => {
        let updatedText = textarea.value.trim();

        if (updatedText === "") {
            updatedText = currentText; 
        }

        let updatedParagraph = document.createElement('p');
        updatedParagraph.textContent = updatedText;
        chatDetail.replaceChild(updatedParagraph, textarea);

        // Remove all chats below the current one
        let chatIndex = Array.from(chatContainer.children).indexOf(chatElement);
        let totalChats = chatContainer.children.length;

        for (let i = totalChats - 1; i > chatIndex; i--) {
            chatContainer.children[i].remove();
        }

        // Fetch a new response for the updated message
        setTimeout(() => {
            incomingChat(updatedText); 
        }, 500);

        scrollBottom(); 
    });

    // Save changes on pressing Enter
    textarea.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            textarea.blur(); 
        }
    });
};

