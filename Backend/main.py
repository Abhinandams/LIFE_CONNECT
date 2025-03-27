from flask import Flask, request, jsonify
from twilio.rest import Client
import os
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
# Twilio credentials from environment variables
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

# Initialize Twilio Client
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

class Donor:
    def __init__(self, name, phone, blood_group, location):
        self.name = name
        self.phone = phone
        self.blood_group = blood_group
        self.location = location

def send_blood_request_sms(donor):
    """
    Send an urgent blood request SMS to a donor
    
    :param donor: Donor object containing donor details
    :return: Message SID or error message
    """
    try:
        message = twilio_client.messages.create(
            body=f"""🚨 Urgent Blood Request! 🚨
Dear {donor.name}, we need {donor.blood_group} blood at {donor.location}. Please respond ASAP!""",
            from_=TWILIO_PHONE_NUMBER,
            to=donor.phone
        )
        return message.sid
    except Exception as e:
        return f"Error sending SMS: {str(e)}"

@app.route('/send_blood_request', methods=['POST'])
def send_blood_request():
    """
    API endpoint to send blood request SMS
    
    Expected JSON payload:
    {
        "name": "John Doe",
        "phone": "+1234567890",
        "blood_group": "O+",
        "location": "City Hospital"
    }
    """
    data = request.json
    
    # Validate incoming data
    if not all(key in data for key in ['name', 'phone', 'blood_group', 'location']):
        return jsonify({
            "status": "error",
            "message": "Missing required fields"
        }), 400
    
    # Create donor object
    donor = Donor(
        name=data['name'],
        phone=data['phone'],
        blood_group=data['blood_group'],
        location=data['location']
    )
    
    # Send SMS
    result = send_blood_request_sms(donor)

    # Check if message was sent successfully
    if 'Error' in result:
        return jsonify({
            "status": "error",
            "message": result
        }), 500
    
    return jsonify({
        "status": "success",
        "message_sid": result
    }), 200

if __name__ == '__main__':
    app.run(debug=True)

# Requirements file (requirements.txt)
"""
flask
twilio
python-dotenv
"""

# .env file example
"""
TWILIO_ACCOUNT_SID=***
TWILIO_AUTH_TOKEN=***
TWILIO_PHONE_NUMBER=***
"""
