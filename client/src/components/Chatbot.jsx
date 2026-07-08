import React, { useState, useRef, useEffect } from "react";
import { FaCommentDots, FaTimes, FaUser } from "react-icons/fa";
import { Button } from "./ui/button";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! How can I help you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const messageContainerRef = useRef(null);
  const [category, setCategory] = useState(null); // Track last mentioned category

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;
    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setTimeout(() => {
      handleBotResponse(newMessages, setCategory);
    }, 500);
  };

  const getBotResponse = (input) => {
    input = input.toLowerCase();

    if (input.includes("hii") || input.includes("hello")) {
      return "Hii!! Please Ask me your query";
    }
    if (input.includes("thank you") || input.includes("thank")) {
      return "You are most welcome!!";
    }
    if (input.includes("laptop") || input.includes("computer")) {
      return "We have laptops and computers starting at Rs 41,000! Check out brands like Dell, HP, and Lenovo.";
    }
    if (input.includes("phone") || input.includes("mobile")) {
      return "Our smartphones start at Rs 24,000. Popular brands include Apple, Samsung, and Xiaomi!";
    }
    if (input.includes("headphones") || input.includes("audio")) {
      return "Looking for great sound? Our headphones start at Rs 4,000 from JBL, Sony, and Bose.";
    }
    if (input.includes("speakers")) {
      return "Our speakers deliver high-quality sound and start at just Rs 8,200! Check out our Bluetooth speaker collection.";
    }
    if (input.includes("keyboard")) {
      return "We have keyboards for work and gaming, starting at Rs 2,500!";
    }
    if (input.includes("smartwatch") || input.includes("watch")) {
      return "Our smartwatches combine style and technology, starting at Rs 12,500. Brands include Apple, Samsung, and Fitbit.";
    }
    if (input.includes("help") || input.includes("assist")) {
      return "I can assist you with product details, pricing, or availability. Just ask!";
    }
    return "I'm sorry, I didn't quite catch that. Can you rephrase your query about electronics?";
  };

  const handleBotResponse = (currentMessages, setCategory) => {
    const userMessage = currentMessages[currentMessages.length - 1].text
      .toLowerCase()
      .trim();
    let botReply = getBotResponse(userMessage); // Use Chatbot1's logic first

    if (!botReply || botReply.includes("I'm sorry")) {
      // Fallback to Chatbot2's logic
      const isNumber = /^[0-9]+$/.test(userMessage);

      if (
        userMessage.includes("price") ||
        userMessage.includes("under") ||
        userMessage.includes("above") ||
        isNumber
      ) {
        botReply =
          "I'm sorry, I can't filter products by price range at this time. You can browse our products or shop by category or brand.";
        setCategory(null);
      } else if (
        userMessage.includes("category") ||
        userMessage.includes("categories") ||
        userMessage.includes("power bank") ||
        userMessage.includes("gaming")
      ) {
        botReply =
          "Sure, you can shop by categories like 'Laptop', 'Mobile', 'Headphones', 'Speaker', 'Power bank' or 'Gaming Accessories'. Which category are you interested in?";
        if (userMessage.includes("laptop")) {
          setCategory("laptop");
        } else if (userMessage.includes("mobile")) {
          setCategory("mobile");
        } else if (userMessage.includes("headphones")) {
          setCategory("headphones");
        } else if (userMessage.includes("speaker")) {
          setCategory("speaker");
        } else if (userMessage.includes("power bank")) {
          setCategory("power bank");
        } else if (userMessage.includes("gaming")) {
          setCategory("gaming");
        }
      } else if (
        userMessage.includes("brand") ||
        userMessage.includes("brands")
      ) {
        botReply =
          "We have popular brands like 'Redmi', 'Samsung', 'Apple', 'OnePlus', 'Dell', and 'Lenovo'. Which one would you like to browse?";
        setCategory(null);
      } else if (userMessage.includes("product")) {
        botReply =
          "Explore our products on the page above. Would you like to search for a specific product?";
        setCategory(null);
      } else if (userMessage.includes("cart")) {
        botReply =
          "You can add products to your cart by clicking the add to cart button on product cards. Do you have any products in mind?";
        setCategory(null);
      }
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: botReply, sender: "bot" },
    ]);
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${
        isOpen ? "w-96 max-h-[600px]" : "w-14 h-14"
      } transition-all duration-300`}
    >
      {isOpen ? (
        <div className="bg-white rounded-md shadow-lg flex flex-col h-full overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b">
            <h4 className="text-lg font-semibold">Chatbot Assistant</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleChat}
              className="hover:bg-gray-100"
            >
              <FaTimes className="h-5 w-5" />
            </Button>
          </div>
          <div
            className="p-4 flex-1 overflow-y-auto space-y-2 max-h-[400px]" // Apply max-height and enable scrolling
            ref={messageContainerRef}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-md ${
                    message.sender === "user"
                      ? "bg-blue-100 text-right"
                      : "bg-gray-100 text-left"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="flex items-center">
                      <FaUser className="w-3 h-3 mr-1 text-gray-500" />
                      {message.text}
                    </div>
                  )}
                  {message.sender === "user" && message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 flex">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border rounded-md px-3 py-2 mr-2 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleToggleChat}
          className="rounded-full p-3 bg-blue-500 hover:bg-blue-600 text-white shadow-md"
        >
          <FaCommentDots className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Chatbot;