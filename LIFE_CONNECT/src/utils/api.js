export const sendSOSToDonors = async (donors) => {
    try {
        const response = await fetch("http://localhost:5000/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ donors }),
        });

        const result = await response.json();
        console.log("Server Response:", result);

        if (response.ok) {
            alert("📢 SOS sent to selected donors successfully!");
        } else {
            alert(`❌ Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Failed to send SOS.");
    }
};
